import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { AppContextProvider } from './context/AppContext';
import Layout from './components/Layout';
import Card from './components/Card';
import Skeleton from './components/Skeleton';
import Snowfall from 'react-snowfall';
import { useLoginNotification } from './hooks/useLoginNotification';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddRun = lazy(() => import('./pages/AddRun'));
const EditRun = lazy(() => import('./pages/EditRun'));
const RunsHistory = lazy(() => import('./pages/RunsHistory'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProtectedInsights = lazy(() => import('./pages/ProtectedInsights'));
const Settings = lazy(() => import('./pages/Settings'));
// for 404 page
const NotFound = lazy(() => import('./pages/NotFound'));


// Using a more generic page skeleton for the suspense fallback
const PageSkeleton: React.FC = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-48 p-0"><Skeleton className="w-full h-full" /></Card>
            <Card className="h-48 p-0"><Skeleton className="w-full h-full" /></Card>
        </div>
        <Card className="h-64 p-0"><Skeleton className="w-full h-full" /></Card>
    </div>
);

const FullPageLoader: React.FC = () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <svg width="64px" height="48px">
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back" style={{fill: 'none', stroke: '#ff630033', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round'}} />
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front" style={{fill: 'none', stroke: '#ff6300', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: '48, 144', strokeDashoffset: 192, animation: 'dash 1.4s linear infinite'}} />
        </svg>
        <style>{`
            @keyframes dash {
                72.5% { opacity: 0; }
                to { stroke-dashoffset: 0; }
            }
        `}</style>
    </div>
);


const App: React.FC = () => {
  return (
    <AppContextProvider>
      <Router>
        {/* Snowfall off */}
        {/* <Snowfall snowflakeCount={100} style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }} /> */}
        <AppContent />
      </Router>
    </AppContextProvider>
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
            <>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
              <SignedIn>
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
              </SignedIn>
            </>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
