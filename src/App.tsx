
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthWrapper from "@/components/layout/AuthWrapper";
import { addTransitionStyles } from "@/lib/barbaTransitions";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Import all pages and components
import Index from "./pages/Index";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";
import ForgotPassword from "./auth/ForgotPassword";
import PendingVerification from "./auth/PendingVerification";
import VerificationLoading from "./auth/VerificationLoading";
import Unauthorized from "./auth/Unauthorized";
import NotFound from "./pages/NotFound";
import LocationDemo from "./pages/LocationDemo";
import DashboardRouter from "./components/DashboardRouter";

// Admin Dashboard Components
import AdminDashboard from "./adminDashboard/AdminDashboard";
import AllVoters from "./adminDashboard/AllVoters";
import AddVoters from "./adminDashboard/AddVoters";
import Analytics from "./adminDashboard/Analytics";
import SMSCampaign from "./adminDashboard/SMSCampaign";
import DataHub from "./adminDashboard/DataHub";
import GoogleForm from "./adminDashboard/GoogleForm";
import UserVerify from "./adminDashboard/usersverify/UserVerify";
import PDFPreview from "./adminDashboard/PDFPreview";
import LocationManagement from "./adminDashboard/LocationManagement";
import SystemSettings from "./adminDashboard/SystemSettings";

// Documentation Pages
import Documentation from "./pages/Documentation";
import VoterManagement from "./pages/docs/VoterManagement";
import LocationDocumentation from "./pages/docs/LocationManagement";
import AnalyticsSystem from "./pages/docs/AnalyticsSystem";
import SMSCampaignDocs from "./pages/docs/SMSCampaign";
import DataHubDocs from "./pages/docs/DataHub";
import SystemSettingsDocs from "./pages/docs/SystemSettings";
import APIReference from "./pages/docs/APIReference";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Add CSS transitions for smooth page changes
    addTransitionStyles();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AuthWrapper>
                <div className="min-h-screen">
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
                    <Route path="/documentation/voter-management" element={<VoterManagement />} />
                    <Route path="/documentation/location-management" element={<LocationDocumentation />} />
                    <Route path="/documentation/analytics-system" element={<AnalyticsSystem />} />
                    <Route path="/documentation/sms-campaigns" element={<SMSCampaignDocs />} />
                    <Route path="/documentation/data-hub" element={<DataHubDocs />} />
                    <Route path="/documentation/system-settings" element={<SystemSettingsDocs />} />
                    <Route path="/documentation/api-reference" element={<APIReference />} />

                    {/* Main Dashboard Route - Role-based routing */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes with user-friendly names */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/home" element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/all-voters" element={
                      <ProtectedRoute>
                        <AllVoters />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/pdf-preview" element={
                      <ProtectedRoute>
                        <PDFPreview />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/add-new-voter" element={
                      <ProtectedRoute>
                        <AddVoters />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/google-forms" element={
                      <ProtectedRoute>
                        <GoogleForm />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/analytics-reports" element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/sms-campaigns" element={
                      <ProtectedRoute requiredRole="division_admin">
                        <SMSCampaign />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/data-management" element={
                      <ProtectedRoute requiredRole="super_admin">
                        <DataHub />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/user-verification" element={
                      <ProtectedRoute>
                        <UserVerify />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/location-management" element={
                      <ProtectedRoute requiredRole="super_admin">
                        <LocationManagement />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin/system-configuration" element={
                      <ProtectedRoute requiredRole="super_admin">
                        <SystemSettings />
                      </ProtectedRoute>
                    } />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </AuthWrapper>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
