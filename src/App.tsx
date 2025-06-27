
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthWrapper from "@/components/layout/AuthWrapper";
import Index from "./pages/Index";
import Login from "./authentication/Login";
import SignUp from "./authentication/SignUp";
import ForgotPassword from "./authentication/ForgotPassword";
import PendingVerification from "./authentication/PendingVerification";
import VerificationLoading from "./authentication/VerificationLoading";
import Unauthorized from "./authentication/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./adminDashboard/AdminDashboard";
import AllVoters from "./adminDashboard/AllVoters";
import AddVoters from "./adminDashboard/AddVoters";
import Analytics from "./adminDashboard/Analytics";
import SMSCampaign from "./adminDashboard/SMSCampaign";
import SMSCampaignNew from "./adminDashboard/SMSCampaignNew";
import DataHub from "./adminDashboard/DataHub";
import GoogleForm from "./adminDashboard/GoogleForm";
import UserVerify from "./adminDashboard/usersverify/UserVerify";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/pending-verification" element={<PendingVerification />} />
              <Route path="/verification-loading" element={<VerificationLoading />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/voters" element={
                <ProtectedRoute>
                  <AllVoters />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/add-voter" element={
                <ProtectedRoute>
                  <AddVoters />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/bulk-upload" element={
                <ProtectedRoute>
                  <AddVoters />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/google-form" element={
                <ProtectedRoute>
                  <GoogleForm />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sms-campaign" element={
                <ProtectedRoute requiredRole="moderator">
                  <SMSCampaign />
                </ProtectedRoute>
              } />

              <Route path="/admin/sms-campaign-new" element={
                <ProtectedRoute requiredRole="moderator">
                  <SMSCampaignNew />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/data-hub" element={
                <ProtectedRoute requiredRole="moderator">
                  <DataHub />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/verify-users" element={
                <ProtectedRoute requiredRole="admin">
                  <UserVerify />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
