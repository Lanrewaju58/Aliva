import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

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
            <TooltipProvider>
              <Toaster 
                position="top-right"
                richColors
                closeButton
                expand={false}
                duration={4000}
              />
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes */}
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
                  path="/onboarding" 
                  element={
                    <ProtectedRoute>
                      <Onboarding />
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
                  path="/upgrade" 
                  element={
                    <ProtectedRoute>
                      <Upgrade />
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
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;