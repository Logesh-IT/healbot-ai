
import supabase, { isSupabaseConfigured } from '../supabase';
import { User, UserRole } from '../types';

export class AuthService {
  /**
   * Sign up with email and password
   */
  static async signUp(registerForm: User) {
    if (!isSupabaseConfigured) {
      // Mock Sign Up
      const mockUser = { id: 'mock-' + Date.now(), email: registerForm.email };
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      const newUser = { ...registerForm, id: mockUser.id, patient_id: 'PID-' + Math.random().toString(36).substr(2, 5).toUpperCase() };
      localStorage.setItem('hb_users', JSON.stringify([...localUsers, newUser]));
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password!,
        options: {
          data: {
            username: registerForm.username,
            role: registerForm.role || UserRole.PATIENT
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile in 'users' table
        const patientId = 'PID-' + Math.random().toString(36).substr(2, 5).toUpperCase() + '-' + Date.now().toString().substr(-4);
        
        const { error: profileError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: registerForm.email,
          username: registerForm.username,
          age: registerForm.age,
          gender: registerForm.gender,
          role: registerForm.role || UserRole.PATIENT,
          patient_id: patientId,
          security_question: registerForm.security_question,
          security_answer: registerForm.security_answer
        });

        if (profileError) throw profileError;
      }

      return data;
    } catch (err) {
      // Fallback to mock on network error
      const mockUser = { id: 'mock-' + Date.now(), email: registerForm.email };
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      const newUser = { ...registerForm, id: mockUser.id, patient_id: 'PID-' + Math.random().toString(36).substr(2, 5).toUpperCase() };
      localStorage.setItem('hb_users', JSON.stringify([...localUsers, newUser]));
      return { user: mockUser };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, pass: string) {
    if (!isSupabaseConfigured) {
      // Mock Sign In
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      const user = localUsers.find((u: any) => u.email === email && u.password === pass);
      if (user) return { user: { id: user.id, email: user.email } };
      throw new Error("Invalid credentials or account not found in Demo Mode.");
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        // Try mock fallback if Supabase fails (e.g. user exists only in local)
        const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
        const user = localUsers.find((u: any) => u.email === email && u.password === pass);
        if (user) return { user: { id: user.id, email: user.email } };
        throw error;
      }
      return data;
    } catch (err) {
      // Fallback to mock on network error
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      const user = localUsers.find((u: any) => u.email === email && u.password === pass);
      if (user) return { user: { id: user.id, email: user.email } };
      throw err;
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle() {
    if (!isSupabaseConfigured) {
      throw new Error("Google Login is only available when Supabase is configured in Settings.");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send OTP to email
   */
  static async sendOTP(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error("OTP Login is only available when Supabase is configured in Settings.");
    }
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(email: string, token: string) {
    if (!isSupabaseConfigured) {
      throw new Error("OTP Login is only available when Supabase is configured.");
    }
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out
   */
  static async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured || userId.startsWith('mock-')) {
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      return localUsers.find((u: any) => u.id === userId) || null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>) {
    if (!isSupabaseConfigured || userId.startsWith('mock-')) {
      const localUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
      const updated = localUsers.map((u: any) => u.id === userId ? { ...u, ...updates } : u);
      localStorage.setItem('hb_users', JSON.stringify(updated));
      return updated.find((u: any) => u.id === userId);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return data;
  }

  /**
   * Sync Auth user to Users table (useful for OAuth)
   */
  static async syncProfile(authUser: any) {
    if (!authUser || !isSupabaseConfigured) return null;

    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!existingProfile) {
      const patientId = 'PID-' + Math.random().toString(36).substr(2, 5).toUpperCase() + '-' + Date.now().toString().substr(-4);
      const { data: newProfile, error } = await supabase.from('users').insert({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        role: authUser.user_metadata?.role || UserRole.PATIENT,
        patient_id: patientId
      }).select().single();

      if (error) throw error;
      return newProfile;
    }

    return existingProfile;
  }
}
