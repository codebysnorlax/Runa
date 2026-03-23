import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { AppProviders } from '@/context/AppProviders';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/Toast';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import FullPageLoader from '@/components/FullPageLoader';
import PageSkeleton from '@/components/PageSkeleton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLoginNotification } from '@/hooks/useLoginNotification';

// Lazy load pages for better performance
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AddRun = lazy(() => import('@/pages/AddRun'));
const EditRun = lazy(() => import('@/pages/EditRun'));
const RunsHistory = lazy(() => import('@/pages/RunsHistory'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const ProtectedInsights = lazy(() => import('@/pages/ProtectedInsights'));
const Settings = lazy(() => import('@/pages/Settings'));
// for 404 page
const NotFound = lazy(() => import('@/pages/NotFound'));




const App: React.FC = () => {
  return (
    <AppProviders>
      <ToastProvider>
        <Router>

          <AppContent />
        </Router>
      </ToastProvider>
    </AppProviders>
  );
};

const AppContent: React.FC = () => {
  const { loaded } = useClerk();

  // Initialize login notification hook
  useLoginNotification();

  if (!loaded) {
    return <FullPageLoader />;
  }

  return (
    <>
      <ToastContainer />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/login" element={
            <>
              <SignedOut>
                <Login />
              </SignedOut>
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
            </>
          } />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageSkeleton />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/add-run" element={<AddRun />} />
                      <Route path="/edit-run/:runId" element={<EditRun />} />
                      <Route path="/history" element={<RunsHistory />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/insights" element={<ProtectedInsights />} />
                      <Route path="/settings" element={<Settings />} />
                      {/* for 404 page */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
