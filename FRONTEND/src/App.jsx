import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Navbar  from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import UserAuthPage       from './pages/Login/UserAuthPage';
import AdminAuthPage      from './pages/Login/AdminAuthPage';
import Home               from './pages/Home/Home';
import ResourceList       from './pages/Resources/ResourceList';
import ResourceDetails    from './pages/Resources/ResourceDetails';
import ResourceForm       from './pages/Resources/ResourceForm';
import BookingList        from './pages/Bookings/BookingList';
import BookingForm        from './pages/Bookings/BookingForm';
import StudentProfile     from './pages/Profile/StudentProfile';
import TicketList         from './pages/Tickets/TicketList';
import TicketCreate       from './pages/Tickets/TicketCreate';
import TicketDetails      from './pages/Tickets/TicketDetails';
import AdminBookingDashboard from './pages/Admin/AdminBookingDashboard';
import OAuth2Callback     from './pages/OAuth2Callback/OAuth2Callback';

import './App.css';

const AppErrorBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="loading-state" style={{ minHeight: '100vh' }}>
          <div className="spinner" />
          <p>Something went wrong loading the page. Please refresh.</p>
        </div>
      );
    }

    return this.props.children;
  }
};

/* ── Protected Layout ───────────────────────────────── */
const Layout = ({ children, adminOnly = false, userOnly = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, isAdmin, isUser }    = useAuth();

  if (loading) return (
    <div className="loading-state" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p>Loading CampusNex...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/admin-login" replace />;
  if (userOnly && !isUser) return <Navigate to="/dashboard" replace />;

  return (
    <div className="layout-wrapper">
      <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
      <div className="main-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="content-area" style={{ marginLeft: sidebarOpen ? 'var(--sidebar-w)' : '60px' }}>
          <div className="page-content animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ── App ─────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppErrorBoundary>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public - Authentication Routes */}
              <Route path="/login" element={<UserAuthPage />} />
              <Route path="/admin-login" element={<AdminAuthPage />} />
              <Route path="/oauth2/callback" element={<OAuth2Callback />} />

              {/* User + Admin routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"       element={<Layout><Home /></Layout>} />
              <Route path="/resources"        element={<Layout><ResourceList /></Layout>} />
              <Route path="/resources/new"    element={<Layout adminOnly><ResourceForm /></Layout>} />
              <Route path="/resources/:id"    element={<Layout><ResourceDetails /></Layout>} />
              <Route path="/resources/:id/edit" element={<Layout adminOnly><ResourceForm /></Layout>} />
              <Route path="/resources/:resourceId/book" element={<Layout userOnly><BookingForm /></Layout>} />
              <Route path="/bookings"         element={<Layout><BookingList /></Layout>} />
              <Route path="/profile"          element={<Layout userOnly><StudentProfile /></Layout>} />
              <Route path="/tickets"          element={<Layout><TicketList /></Layout>} />
              <Route path="/tickets/new"      element={<Layout><TicketCreate /></Layout>} />
              <Route path="/tickets/:id"      element={<Layout><TicketDetails /></Layout>} />

              {/* Admin only */}
              <Route path="/admin" element={<Layout adminOnly><AdminBookingDashboard /></Layout>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AppErrorBoundary>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
