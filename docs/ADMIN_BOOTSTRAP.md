# PrimePrep: Platform Administrator Bootstrap Guide

## Overview

PrimePrep strictly enforces least-privilege Role-Based Access Control (RBAC). 
Student registrations always default to the `student` role. 
Database triggers (`prevent_role_escalation`) and Row Level Security (RLS) policies prohibit users from assigning themselves administrative privileges (`content_admin` or `platform_admin`) through browser APIs, registration forms, or ordinary profile updates.

Administrative roles must be established through a trusted mechanism.

---

## Method 1: Direct SQL in Supabase Dashboard (Recommended)

1. Open your **Supabase Dashboard** for the PrimePrep project.
2. Go to **SQL Editor** -> **New Query**.
3. Identify the target candidate user who has registered via the website:
   ```sql
   SELECT id, email, created_at FROM auth.users WHERE email = 'your-admin-email@domain.com';
   ```
4. Promote the profile to `platform_admin`:
   ```sql
   UPDATE public.profiles
   SET role = 'platform_admin', updated_at = now()
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@domain.com');

   -- Log the bootstrap action to audit_logs
   INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'your-admin-email@domain.com'),
     'BOOTSTRAP_FIRST_PLATFORM_ADMIN',
     'profiles',
     (SELECT id::text FROM auth.users WHERE email = 'your-admin-email@domain.com'),
     '{"note": "Initial platform administrator bootstrapped via database administrative console"}'::jsonb
   );
   ```
5. Confirm the role assignment:
   ```sql
   SELECT id, full_name, role FROM public.profiles WHERE role = 'platform_admin';
   ```

---

## Method 2: Server-Side API via Service Role Key

If managing deployments programmatically without direct dashboard access, the trusted backend server (`server.ts`) supports administrative promotion using the server's private `SUPABASE_SERVICE_ROLE_KEY`:

```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-Admin-Bootstrap-Key: <ADMIN_BOOTSTRAP_SECRET>" \
  -d '{
    "email": "your-admin-email@domain.com",
    "target_role": "platform_admin"
  }'
```

---

## Supported Roles & Permissions Matrix

| Capability / Permission | `student` | `content_admin` | `platform_admin` |
| :--- | :---: | :---: | :---: |
| Browse published exams, subjects & chapters | **Yes** | **Yes** | **Yes** |
| Attempt tests & view personal responses | **Yes** | **Yes** | **Yes** |
| Create and edit questions & draft tests | No | **Yes** | **Yes** |
| Preview unpublished draft tests | No | **Yes** | **Yes** |
| Manage examinations, subjects & chapters | No | No | **Yes** |
| Configure test categories & default counts | No | No | **Yes** |
| Manage test products & access entitlements | No | No | **Yes** |
| Promote/demote users (`content_admin`) | No | No | **Yes** |
| Inspect system `audit_logs` | No | No | **Yes** |
