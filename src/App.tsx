
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthWrapper from '@/components/layout/AuthWrapper';
import Login from '@/auth/Login';
import Register from '@/auth/Register';
import DashboardRouter from '@/components/DashboardRouter';
import NotFound from '@/pages/NotFound';
import AllVoters from '@/adminDashboard/AllVoters';
import AddVoters from '@/adminDashboard/AddVoters';
import VillageVotersList from '@/components/village/VillageVotersList';
import VillageAddVoter from '@/components/village/VillageAddVoter';
import SMSCampaign from '@/adminDashboard/SMSCampaign';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Protected Route wrapper for role-based access
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>;
  }
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userProfile.approved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">অনুমোদনের অপেক্ষায়</h2>
          <p className="text-gray-600">আপনার অ্যাকাউন্ট এখনও অনুমোদিত হয়নি।</p>
        </div>
      </div>
    );
  }
  
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthWrapper>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            
            {/* Super Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            <Route path="/admin/all-voters" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AllVoters />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-new-voter" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AddVoters />
              </ProtectedRoute>
            } />
            
            {/* Village Admin specific routes */}
            <Route path="/admin/voters" element={
              <ProtectedRoute allowedRoles={['village_admin']}>
                <VillageVotersList />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-voter" element={
              <ProtectedRoute allowedRoles={['village_admin']}>
                <VillageAddVoter />
              </ProtectedRoute>
            } />
            
            {/* Shared routes for both roles */}
            <Route path="/admin/sms-campaign" element={
              <ProtectedRoute allowedRoles={['super_admin', 'village_admin']}>
                <SMSCampaign />
              </ProtectedRoute>
            } />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthWrapper>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
