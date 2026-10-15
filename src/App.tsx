/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/design-system/Navbar';
import { Footer } from './components/design-system/Footer';
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

function AppContent() {
  const { pathname, navigate } = useRouter();

  // Route matching
  const renderPage = () => {
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
