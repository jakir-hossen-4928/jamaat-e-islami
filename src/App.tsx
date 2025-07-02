
import { useEffect, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DataAccessProvider } from "@/contexts/DataAccessContext";
import AuthWrapper from "@/components/layout/AuthWrapper";
import { addTransitionStyles } from "@/lib/barbaTransitions";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { LocationBasedAccessWrapper } from "@/components/LocationBasedAccessWrapper";
import Loading from "./components/loader/Loading";

// Lazy load all pages and dashboard components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./auth/Login"));
const Register = lazy(() => import("./auth/Register"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const PendingVerification = lazy(() => import("./auth/PendingVerification"));
const VerificationLoading = lazy(() => import("./auth/VerificationLoading"));
const Unauthorized = lazy(() => import("./auth/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LocationDemo = lazy(() => import("./pages/LocationDemo"));
const DashboardRouter = lazy(() => import("./components/DashboardRouter"));

// Admin Dashboard Components
const AdminDashboard = lazy(() => import("./adminDashboard/AdminDashboard"));
const AllVoters = lazy(() => import("./adminDashboard/AllVoters"));
const AddVoters = lazy(() => import("./adminDashboard/AddVoters"));
const Analytics = lazy(() => import("./adminDashboard/Analytics"));
const SMSCampaign = lazy(() => import("./adminDashboard/SMSCampaign"));
const DataHub = lazy(() => import("./adminDashboard/DataHub"));
const GoogleForm = lazy(() => import("./adminDashboard/GoogleForm"));
const UserVerify = lazy(() => import("./adminDashboard/usersverify/UserVerify"));
const PDFPreview = lazy(() => import("./adminDashboard/PDFPreview"));
const LocationManagement = lazy(() => import("./adminDashboard/LocationManagement"));
const SystemSettings = lazy(() => import("./adminDashboard/SystemSettings"));

// Documentation Pages
const Documentation = lazy(() => import("./pages/Documentation"));
const VoterManagement = lazy(() => import("./pages/docs/VoterManagement"));
const LocationDocumentation = lazy(() => import("./pages/docs/LocationManagement"));
const AnalyticsSystem = lazy(() => import("./pages/docs/AnalyticsSystem"));
const SMSCampaignDocs = lazy(() => import("./pages/docs/SMSCampaign"));
const DataHubDocs = lazy(() => import("./pages/docs/DataHub"));
const SystemSettingsDocs = lazy(() => import("./pages/docs/SystemSettings"));
const APIReference = lazy(() => import("./pages/docs/APIReference"));

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
              <DataAccessProvider>
                <AuthWrapper>
                  <div className="min-h-screen">
                    <Suspense fallback={<Loading fullScreen message="পেজ লোড হচ্ছে..." />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
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

                        {/* Protected Routes - wrap all in LocationBasedAccessWrapper */}
                        <Route
                          path="/*"
                          element={
                            <ProtectedRoute>
                              <LocationBasedAccessWrapper>
                                <Routes>
                                  <Route path="dashboard" element={<DashboardRouter />} />
                                  <Route path="admin" element={<AdminDashboard />} />
                                  <Route path="admin/home" element={<AdminDashboard />} />
                                  <Route path="admin/all-voters" element={<AllVoters />} />
                                  <Route path="admin/pdf-preview" element={<PDFPreview />} />
                                  <Route path="admin/add-new-voter" element={<AddVoters />} />
                                  <Route path="admin/google-forms" element={<GoogleForm />} />
                                  <Route path="admin/analytics-reports" element={<Analytics />} />
                                  <Route path="admin/sms-campaigns" element={<SMSCampaign />} />
                                  <Route path="admin/data-management" element={<DataHub />} />
                                  <Route path="admin/user-verification" element={<UserVerify />} />
                                  <Route path="admin/location-management" element={<LocationManagement />} />
                                  <Route path="admin/system-configuration" element={<SystemSettings />} />
                                  {/* Add more protected routes as needed */}
                                </Routes>
                              </LocationBasedAccessWrapper>
                            </ProtectedRoute>
                          }
                        />

                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                </AuthWrapper>
              </DataAccessProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
