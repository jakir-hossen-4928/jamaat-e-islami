
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { rateLimit, passwordValidation, securityMessages, securityLogger } from '@/lib/security';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);

  const secureLogin = async (email: string, password: string) => {
    const identifier = `login_${email}`;
    
    // Check rate limiting
    if (rateLimit.isLimited(identifier)) {
      securityLogger.logSuspiciousActivity('rate_limit_exceeded', { email });
      toast.error(securityMessages.auth.tooManyAttempts);
      return { success: false, error: 'rate_limited' };
    }

    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      securityLogger.logAuthAttempt(email, true);
      rateLimit.reset(identifier); // Reset on success
      setLoading(false);
      return { success: true, user: result.user };
    } catch (error: any) {
      setLoading(false);
      securityLogger.logAuthAttempt(email, false, error.code);
      
      // Generic error message regardless of specific error
      let message = securityMessages.auth.invalidCredentials;
      
      if (error.code === 'auth/too-many-requests') {
        message = securityMessages.auth.tooManyAttempts;
      } else if (error.code === 'auth/network-request-failed') {
        message = securityMessages.auth.networkError;
      }
      
      toast.error(message);
      return { success: false, error: error.code };
    }
  };

  const secureRegister = async (
    email: string, 
    password: string, 
    displayName: string,
    role: 'union_admin' | 'village_admin',
    accessScope: {
      division_id: string;
      district_id: string;
      upazila_id: string;
      union_id: string;
      village_id?: string;
      division_name: string;
      district_name: string;
      upazila_name: string;
      union_name: string;
      village_name?: string;
    }
  ) => {
    const identifier = `register_${email}`;
    
    // Validate required location scope
    if (!accessScope.division_id || !accessScope.district_id || !accessScope.upazila_id || !accessScope.union_id) {
      toast.error('সম্পূর্ণ লোকেশন তথ্য প্রয়োজন');
      return { success: false, error: 'missing_location_scope' };
    }

    // For village admin, village_id is required
    if (role === 'village_admin' && !accessScope.village_id) {
      toast.error('গ্রাম অ্যাডমিনের জন্য গ্রামের তথ্য প্রয়োজন');
      return { success: false, error: 'missing_village_scope' };
    }
    
    // Check rate limiting
    if (rateLimit.isLimited(identifier, 3)) {
      securityLogger.logSuspiciousActivity('registration_rate_limit', { email });
      toast.error('অনেকবার নিবন্ধনের চেষ্টা করেছেন। ৩০ মিনিট পর আবার চেষ্টা করুন।');
      return { success: false, error: 'rate_limited' };
    }

    // Validate password strength
    const validation = passwordValidation.validate(password);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return { success: false, error: 'weak_password' };
    }

    setLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile with location scope
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email,
        displayName,
        role,
        accessScope,
        approved: false, // Requires approval
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      securityLogger.logAuthAttempt(email, true, 'registration');
      rateLimit.reset(identifier);
      setLoading(false);
      return { success: true, user: result.user };
    } catch (error: any) {
      setLoading(false);
      securityLogger.logAuthAttempt(email, false, `registration_${error.code}`);
      
      let message = 'নিবন্ধনে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে।';
      } else if (error.code === 'auth/weak-password') {
        message = 'পাসওয়ার্ড আরও শক্তিশালী করুন।';
      } else if (error.code === 'auth/invalid-email') {
        message = 'ইমেইল ঠিকানা সঠিক নয়।';
      }
      
      toast.error(message);
      return { success: false, error: error.code };
    }
  };

  return {
    secureLogin,
    secureRegister,
    loading
  };
};
