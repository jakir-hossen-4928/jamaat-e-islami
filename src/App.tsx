
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./authentication/Login";
import SignUp from "./authentication/SignUp";
import ForgotPassword from "./authentication/ForgotPassword";
import PendingVerification from "./authentication/PendingVerification";
import Unauthorized from "./authentication/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./adminDashboard/AdminDashboard";
import AllVoters from "./adminDashboard/AllVoters";
import AddVoters from "./adminDashboard/AddVoters";
import Analytics from "./adminDashboard/Analytics";
import SMSCampaign from "./adminDashboard/SMSCampaign";
import DataHub from "./adminDashboard/DataHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pending-verification" element={<PendingVerification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/voters" element={
              <ProtectedRoute requiredRole="admin">
                <AllVoters />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-voters" element={
              <ProtectedRoute requiredRole="admin">
                <AddVoters />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/sms" element={
              <ProtectedRoute requiredRole="admin">
                <SMSCampaign />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/data-hub" element={
              <ProtectedRoute requiredRole="admin">
                <DataHub />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
