import { useEffect, Suspense } from "react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const OrganizationPage = React.lazy(() => import("./pages/OrganizationPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const AppearancePage = React.lazy(() => import("./pages/AppearancePage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const StudentsPage = React.lazy(() => import("./pages/StudentsPage"));
const TeachersPage = React.lazy(() => import("./pages/TeachersPage"));
const ParentsPage = React.lazy(() => import("./pages/ParentsPage"));
const ClassesPage = React.lazy(() => import("./pages/ClassesPage"));
const SubjectsPage = React.lazy(() => import("./pages/SubjectsPage"));
const AttendancePage = React.lazy(() => import("./pages/AttendancePage"));
const LecturesPage = React.lazy(() => import("./pages/LecturesPage"));
const HomeworkPage = React.lazy(() => import("./pages/HomeworkPage"));
const ExamsPage = React.lazy(() => import("./pages/ExamsPage"));
const ResultsPage = React.lazy(() => import("./pages/ResultsPage"));
const GalleryPage = React.lazy(() => import("./pages/GalleryPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/appearance" element={<AppearancePage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/lectures" element={<LecturesPage />} />
              <Route path="/homework" element={<HomeworkPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;