
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
import PDFPreview from "./adminDashboard/PDFPreview";
import LocationDemo from "./pages/LocationDemo";
import DashboardRouter from "./components/DashboardRouter";
import LocationManagement from "./adminDashboard/LocationManagement";
import SystemSettings from "./adminDashboard/SystemSettings";
import Documentation from "./pages/Documentation";

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
              <Route path="/location-demo" element={<LocationDemo />} />

              {/* Documentation Routes */}
              <Route path="/docs" element={<Documentation />} />
              <Route path="/docs/*" element={<Documentation />} />

              {/* Main Dashboard Route - Role-based routing */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />

              {/* Admin Routes - Updated to use new role system */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/voters" element={
                <ProtectedRoute>
                  <AllVoters />
                </ProtectedRoute>
              } />

              <Route path="/admin/pdf-preview" element={
                <ProtectedRoute>
                  <PDFPreview />
                </ProtectedRoute>
              } />

              <Route path="/admin/add-voter" element={
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
                <ProtectedRoute requiredRole="division_admin">
                  <SMSCampaign />
                </ProtectedRoute>
              } />

              <Route path="/admin/sms-campaign-new" element={
                <ProtectedRoute requiredRole="division_admin">
                  <SMSCampaignNew />
                </ProtectedRoute>
              } />

              <Route path="/admin/data-hub" element={
                <ProtectedRoute requiredRole="super_admin">
                  <DataHub />
                </ProtectedRoute>
              } />

              <Route path="/admin/verify-users" element={
                <ProtectedRoute requiredRole="super_admin">
                  <UserVerify />
                </ProtectedRoute>
              } />

              <Route path="/admin/location-management" element={
                <ProtectedRoute requiredRole="super_admin">
                  <LocationManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/system-settings" element={
                <ProtectedRoute requiredRole="super_admin">
                  <SystemSettings />
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
