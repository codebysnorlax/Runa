import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppContextProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Card from './components/Card';
import Skeleton from './components/Skeleton';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddRun = lazy(() => import('./pages/AddRun'));
const EditRun = lazy(() => import('./pages/EditRun'));
const RunsHistory = lazy(() => import('./pages/RunsHistory'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProtectedInsights = lazy(() => import('./pages/ProtectedInsights'));
const Settings = lazy(() => import('./pages/Settings'));


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
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-orange"></div>
    </div>
);


const App: React.FC = () => {
  return (
    <AppContextProvider>
      <Router>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
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
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
      <SpeedInsights />
    </AppContextProvider>
  );
};

export default App;