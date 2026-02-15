import React from "react";
// Re-trigger HMR
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/layouts/AppShell";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Progress from "./pages/Progress";
import Security from "./pages/Security";
import MealPlanner from "./pages/MealPlanner";
import Upgrade from "./pages/Upgrade";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import Blog from "./pages/Blog";

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <HealthDataProvider>
              <TooltipProvider>
                <Toaster
                  position="top-right"
                  closeButton
                  expand={false}
                  duration={4000}
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--primary))',
                      color: 'white',
                      border: '1px solid hsl(var(--primary) / 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.3)',
                    },
                    classNames: {
                      title: 'font-semibold text-white',
                      description: 'text-white/80',
                      closeButton: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
                      success: 'bg-primary border-primary/30',
                      error: 'bg-destructive border-destructive/30',
                    },
                  }}
                />
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/upgrade" element={<Upgrade />} />

                  {/* Onboarding - Protected but outside AppShell for full-screen experience */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes */}
                  {/* App Routes - Wrapped in AppShell */}
                  <Route element={<AppShell />}>
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/progress"
                      element={
                        <ProtectedRoute>
                          <Progress />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/meal-planner"
                      element={
                        <ProtectedRoute>
                          <MealPlanner />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blog"
                      element={
                        <ProtectedRoute>
                          <Blog />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    {/* Support Pages within App Shell context if desired, or keep outside */}
                    <Route path="/help" element={<HelpCenter publicView={false} />} />
                    <Route path="/security" element={<Security publicView={false} />} />
                  </Route>

                  {/* Company Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Support Pages */}
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/security" element={<Security />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingThemeToggle />
              </TooltipProvider>
            </HealthDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;