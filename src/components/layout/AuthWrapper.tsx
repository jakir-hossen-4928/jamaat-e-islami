
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Loader2 className="w-8 h-8 mx-auto text-green-600" />
          </motion.div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            সিস্টেম লোড হচ্ছে...
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
