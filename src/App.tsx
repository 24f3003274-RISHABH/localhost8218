/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/design-system/Navbar';
import { Footer } from './components/design-system/Footer';

// Public & Student Pages
import { HomePage } from './pages/HomePage';
import { ExamsCataloguePage } from './pages/ExamsCataloguePage';
import { CuetPgOverviewPage } from './pages/CuetPgOverviewPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { EmptyState } from './components/design-system/EmptyState';
import { Container } from './components/design-system/Container';

// Administrative Console Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminExaminationsPage } from './pages/admin/AdminExaminationsPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminChaptersPage } from './pages/admin/AdminChaptersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminQuestionEditorPage } from './pages/admin/AdminQuestionEditorPage';
import { AdminBulkImportPage } from './pages/admin/AdminBulkImportPage';
import { AdminImportHistoryPage } from './pages/admin/AdminImportHistoryPage';
import { AdminTestsPage } from './pages/admin/AdminTestsPage';
import { AdminTestEditorPage } from './pages/admin/AdminTestEditorPage';

function AppContent() {
  const { pathname, navigate } = useRouter();

  // Check if current route is within /admin
  const isAdminRoute = pathname.startsWith('/admin');

  // Route matching
  const renderPage = () => {
    // 1. ADMIN ROUTES
    if (pathname === '/admin') {
      return <AdminOverviewPage />;
    }
    if (pathname === '/admin/examinations') {
      return <AdminExaminationsPage />;
    }
    if (pathname === '/admin/subjects') {
      return <AdminSubjectsPage />;
    }
    if (pathname === '/admin/chapters') {
      return <AdminChaptersPage />;
    }
    if (pathname === '/admin/categories') {
      return <AdminCategoriesPage />;
    }
    if (pathname === '/admin/questions') {
      return <AdminQuestionsPage />;
    }
    if (pathname === '/admin/questions/new') {
      return <AdminQuestionEditorPage />;
    }
    if (pathname === '/admin/questions/import') {
      return <AdminBulkImportPage />;
    }
    if (pathname.startsWith('/admin/questions/') && pathname.endsWith('/edit')) {
      return <AdminQuestionEditorPage />;
    }
    if (pathname === '/admin/tests') {
      return <AdminTestsPage />;
    }
    if (pathname === '/admin/tests/new') {
      return <AdminTestEditorPage />;
    }
    if (pathname.startsWith('/admin/tests/') && pathname.endsWith('/edit')) {
      return <AdminTestEditorPage />;
    }
    if (pathname === '/admin/import-history') {
      return <AdminImportHistoryPage />;
    }

    // 2. PUBLIC & STUDENT ROUTES
    switch (pathname) {
      case '/':
        return <HomePage />;
      case '/exams':
        return <ExamsCataloguePage />;
      case '/exams/cuet-pg':
        return <CuetPgOverviewPage />;
      case '/pricing':
        return <PricingPage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/student/dashboard':
      case '/portal':
        return <StudentDashboardPage />;
      case '/about':
        return <AboutPage />;
      case '/contact':
        return <ContactPage />;
      default:
        return (
          <div className="py-20">
            <Container>
              <EmptyState
                title="Page Not Found"
                description="The requested page route could not be found. Please check the URL or return to the PrimePrep homepage."
                actionLabel="Return to Home"
                onAction={() => navigate('/')}
              />
            </Container>
          </div>
        );
    }
  };

  // If on admin routes, render dedicated admin layout without public navbar/footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] selection:bg-teal-600 selection:text-white">
        {renderPage()}
      </div>
    );
  }

  // Public marketing & student portal layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main id="main-content" className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
