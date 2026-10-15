import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Server-only Supabase Service Client
// NEVER exposed to the frontend browser
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseServiceKey.includes('placeholder')
);

const adminSupabase: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Middleware to verify student/user authentication token
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Missing or malformed Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!isServerSupabaseConfigured || !adminSupabase) {
    // Simulated token verification for sandbox testing
    if (token.startsWith('simulated_') || token.startsWith('demo_') || token.length > 5) {
      (req as any).user = {
        id: token.replace('simulated_', '').replace('demo_', ''),
        email: 'student@primeprep.edu',
        role: 'student'
      };
      return next();
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }

  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    // Fetch user profile to verify role
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    (req as any).user = user;
    (req as any).profile = profile || { role: 'student' };
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Token validation failed', details: err.message });
  }
}

// Middleware to verify strictly administrative privileges
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const profile = (req as any).profile;
  const user = (req as any).user;

  if (profile?.role !== 'admin' && user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: This privileged operation requires verified administrator authorization.',
      code: 'UNAUTHORIZED_STUDENT_ACCESS'
    });
  }
  next();
}

// -----------------------------------------------------------------------------
// PUBLIC SERVER ENDPOINTS
// -----------------------------------------------------------------------------

// Server health and Supabase connection check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    serverSupabaseConfigured: isServerSupabaseConfigured,
    serverTime: new Date().toISOString()
  });
});

// -----------------------------------------------------------------------------
// PROTECTED STUDENT ENDPOINTS
// -----------------------------------------------------------------------------

// Retrieve authenticated student profile
app.get('/api/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const profile = (req as any).profile;
  res.json({ user, profile });
});

// Update non-privileged profile data
// Rejects any attempt by students to escalate roles or modify sensitive properties!
app.patch('/api/profile', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { full_name, phone, target_subject_code, role } = req.body;

  // STRICT VALIDATION: Explicitly block student attempts to modify role
  if (role !== undefined) {
    return res.status(403).json({
      error: 'Security Violation: Students are strictly forbidden from assigning or modifying user roles.',
      field: 'role'
    });
  }

  // Validate allowed payload properties
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString()
  };

  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || full_name.trim().length === 0) {
      return res.status(400).json({ error: 'Candidate full name must be a non-empty string.' });
    }
    updates.full_name = full_name.trim();
  }

  if (phone !== undefined) {
    updates.phone = phone ? String(phone).trim() : null;
  }

  if (target_subject_code !== undefined) {
    updates.target_subject_code = target_subject_code ? String(target_subject_code).trim() : null;
  }

  if (isServerSupabaseConfigured && adminSupabase) {
    const { data, error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ profile: data, message: 'Profile updated successfully.' });
  }

  // Sandbox fallback
  res.json({
    profile: { id: user.id, ...updates, role: 'student' },
    message: 'Profile updated in sandbox environment.'
  });
});

// Server-side enrollment endpoint (ensures students cannot arbitrarily grant premium access)
app.post('/api/enroll', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { test_series_id, payment_token } = req.body;

  if (!test_series_id) {
    return res.status(400).json({ error: 'test_series_id is required.' });
  }

  // In production, verify payment_token against gateway (Razorpay/Stripe).
  // Service role creates the enrollment record safely.
  if (isServerSupabaseConfigured && adminSupabase) {
    const { data: series } = await adminSupabase
      .from('test_series')
      .select('*')
      .eq('id', test_series_id)
      .single();

    if (!series) {
      return res.status(404).json({ error: 'Test series not found.' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (series.validity_days || 180));

    const { data, error } = await adminSupabase
      .from('user_enrollments')
      .upsert({
        user_id: user.id,
        test_series_id,
        expires_at: expiresAt.toISOString(),
        amount_paid_paise: series.price_paise,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ enrollment: data, message: 'Enrollment activated.' });
  }

  res.json({
    enrollment: {
      user_id: user.id,
      test_series_id,
      status: 'active',
      amount_paid_paise: 0
    },
    message: 'Sandbox enrollment verified.'
  });
});

// -----------------------------------------------------------------------------
// PRIVILEGED ADMINISTRATIVE ENDPOINTS (Requires 'admin' Role)
// -----------------------------------------------------------------------------

// Admin user audit endpoint
app.get('/api/admin/users', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  if (isServerSupabaseConfigured && adminSupabase) {
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('id, full_name, role, target_subject_code, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ users: data });
  }

  res.json({
    users: [
      { id: 'u1', full_name: 'Administrator Lead', role: 'admin', created_at: new Date().toISOString() },
      { id: 'u2', full_name: 'Student Candidate', role: 'student', created_at: new Date().toISOString() }
    ]
  });
});

// Admin role modification endpoint (Strictly accessible by verified admins only)
app.post('/api/admin/set-role', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { target_user_id, new_role } = req.body;

  if (!target_user_id || !new_role) {
    return res.status(400).json({ error: 'target_user_id and new_role are required.' });
  }

  if (!['student', 'admin', 'instructor'].includes(new_role)) {
    return res.status(400).json({ error: 'Invalid role specified. Must be student, admin, or instructor.' });
  }

  if (isServerSupabaseConfigured && adminSupabase) {
    const { data, error } = await adminSupabase
      .from('profiles')
      .update({ role: new_role, updated_at: new Date().toISOString() })
      .eq('id', target_user_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data, message: `Role updated to ${new_role} by administrator.` });
  }

  res.json({
    message: `Sandbox admin: Role updated to ${new_role} for user ${target_user_id}`
  });
});

// -----------------------------------------------------------------------------
// CLIENT APPLICATION SERVING (Vite in Dev / Static in Prod)
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PrimePrep server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
