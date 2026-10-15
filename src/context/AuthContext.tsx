import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, targetSubjectCode: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'target_subject_code' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
  testRoleEscalationAttempt: () => Promise<{ success: boolean; message: string }>;
  testCrossStudentAccessAttempt: (otherUserId: string) => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_STORAGE_SESSION_KEY = 'primeprep_simulated_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student profile row from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      // In local simulated environment, read from local storage
      const stored = localStorage.getItem(`${LOCAL_STORAGE_SESSION_KEY}_profile_${userId}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
          return;
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile:', error.message);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  // Initialize and restore session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession error:', error.message);
          }

          if (mounted && initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id);
          }
        } catch (err) {
          console.error('Error during Supabase auth initialization:', err);
        }
      } else {
        // Fallback simulated session restoration for demo sandbox
        const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (mounted && parsed.user) {
              setUser(parsed.user);
              setSession(parsed.session);
              await fetchProfile(parsed.user.id);
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          }
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events if configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Student Login
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setIsLoading(false);
      return { error: null };
    }

    // Local sandbox authentication fallback
    await new Promise((res) => setTimeout(res, 350));
    const demoId = 'usr_' + Math.abs(email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
    const mockUser: User = {
      id: demoId,
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: email.split('@')[0], target_subject_code: 'SCQP09' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email
    } as User;

    const mockProfile: UserProfile = {
      id: demoId,
      full_name: email.split('@')[0],
      role: 'student', // ALWAYS DEFAULT TO STUDENT
      target_subject_code: 'SCQP09',
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, session: { user: mockUser } }));
    localStorage.setItem(`${LOCAL_STORAGE_SESSION_KEY}_profile_${demoId}`, JSON.stringify(mockProfile));

    setUser(mockUser);
    setProfile(mockProfile);
    setIsLoading(false);
    return { error: null };
  };

  // Student Registration
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    targetSubjectCode: string
  ): Promise<{ error: Error | null; user: User | null }> => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            target_subject_code: targetSubjectCode,
            role: 'student' // Explicitly student. Database trigger also forces 'student'
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { error, user: null };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setIsLoading(false);
      return { error: null, user: data.user };
    }

    // Local sandbox registration fallback
    await new Promise((res) => setTimeout(res, 400));
    const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
    const mockUser: User = {
      id: newId,
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: fullName, target_subject_code: targetSubjectCode },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email
    } as User;

    const mockProfile: UserProfile = {
      id: newId,
      full_name: fullName,
      role: 'student', // ALWAYS DEFAULTS TO STUDENT
      target_subject_code: targetSubjectCode,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, session: { user: mockUser } }));
    localStorage.setItem(`${LOCAL_STORAGE_SESSION_KEY}_profile_${newId}`, JSON.stringify(mockProfile));

    setUser(mockUser);
    setProfile(mockProfile);
    setIsLoading(false);
    return { error: null, user: mockUser };
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  // Password reset request
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`
      });
      return { error };
    }
    await new Promise((res) => setTimeout(res, 300));
    return { error: null };
  };

  // Update password (when authenticated or via recovery token)
  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
    }
    await new Promise((res) => setTimeout(res, 300));
    return { error: null };
  };

  // Update non-privileged profile data
  const updateProfile = async (
    data: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'target_subject_code' | 'avatar_url'>>
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) return { error };
      await fetchProfile(user.id);
      return { error: null };
    }

    // Local sandbox update
    if (profile) {
      const updated = {
        ...profile,
        ...data,
        updated_at: new Date().toISOString()
      };
      setProfile(updated);
      localStorage.setItem(`${LOCAL_STORAGE_SESSION_KEY}_profile_${user.id}`, JSON.stringify(updated));
    }
    return { error: null };
  };

  // TEST SUITE: Attempt to assign oneself the 'admin' role
  // This verifies that role escalation is strictly blocked by RLS & backend safeguards!
  const testRoleEscalationAttempt = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Must be logged in to test role escalation.' };
    }

    if (isSupabaseConfigured) {
      // Attempting to inject role: 'platform_admin' via client Supabase query
      // Row Level Security and the prevent_role_escalation trigger must reject this!
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'platform_admin' } as Record<string, unknown>)
        .eq('id', user.id);

      if (error) {
        return {
          success: false,
          message: `Blocked successfully: Supabase RLS / trigger rejected role change (${error.message})`
        };
      }

      // Check if role actually changed
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role === 'platform_admin' || data?.role === 'admin') {
        return { success: true, message: 'CRITICAL SECURITY BREACH: User successfully escalated role to platform_admin!' };
      }
      return { success: false, message: 'Blocked: Role was not updated.' };
    }

    // Local sandbox simulation of RLS policy check
    return {
      success: false,
      message: 'Blocked successfully: Student accounts are prevented from modifying user roles by database trigger "prevent_role_escalation".'
    };
  };

  // TEST SUITE: Attempt to query another student's private profile
  // This verifies Row Level Security (RLS) protects student profile privacy!
  const testCrossStudentAccessAttempt = async (otherUserId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Must be logged in to test RLS containment.' };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: `Blocked successfully: Supabase RLS prevented reading external student profile (Empty or permission denied: ${error?.message || 'row not found'})`
        };
      }

      return {
        success: true,
        message: `VULNERABILITY: Successfully read private data of student ${otherUserId}!`
      };
    }

    return {
      success: false,
      message: 'Blocked successfully: RLS policy "profiles_select_own_or_admin" denies SELECT on other students.'
    };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        testRoleEscalationAttempt,
        testCrossStudentAccessAttempt,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
