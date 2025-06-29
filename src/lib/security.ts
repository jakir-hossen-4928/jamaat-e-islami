
// Security utilities for authentication and validation

// Rate limiting store (in-memory, for production use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = {
  // Check if request should be rate limited
  isLimited: (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (record.count >= maxAttempts) {
      return true;
    }
    
    record.count++;
    return false;
  },
  
  // Reset rate limit for identifier
  reset: (identifier: string): void => {
    rateLimitStore.delete(identifier);
  }
};

export const passwordValidation = {
  // Enhanced password validation
  validate: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('পাসওয়ার্ডে কমপক্ষে একটি বড় হাতের ইংরেজি অক্ষর থাকতে হবে');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('পাসওয়ার্ডে কমপক্ষে একটি ছোট হাতের ইংরেজি অক্ষর থাকতে হবে');
    }
    
    if (!/\d/.test(password)) {
      errors.push('পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('পাসওয়ার্ডে কমপক্ষে একটি বিশেষ চিহ্ন থাকতে হবে');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export const securityMessages = {
  // Generic error messages to avoid information leakage
  auth: {
    invalidCredentials: 'ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।',
    accountDisabled: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে। সাহায্যের জন্য যোগাযোগ করুন।',
    tooManyAttempts: 'অনেকবার ভুল চেষ্টা করেছেন। ১৫ মিনিট পর আবার চেষ্টা করুন।',
    networkError: 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।',
    unknownError: 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'
  }
};

// Security event logging
export const securityLogger = {
  logAuthAttempt: (email: string, success: boolean, reason?: string) => {
    const event = {
      type: 'auth_attempt',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
      success,
      reason,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // In production, send to your logging service
    console.log('Security Event:', event);
  },
  
  logSuspiciousActivity: (activity: string, details?: any) => {
    const event = {
      type: 'suspicious_activity',
      activity,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.warn('Suspicious Activity:', event);
  }
};
