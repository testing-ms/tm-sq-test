import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "./routes";
import LoginPage from './views/Session/LoginPage';
import { queryClient } from './queryClient';
import Topbar from './components/common/TopBar';
import { AppSidebar } from './components/common/appSidebar';
import { AuthCallback } from '@/components/auth/AuthCallback';
import Home from './views/Home/Home';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import CalendarPage from './views/Calendar/Calendar';
import MeetingPage from './views/Meeting/MeetingPage';
import SettingsPage from './views/Settings/SettingsPage';
import { Toaster } from "@/components/ui/sonner"
import AdminCalendarPage from './views/Admin/Calendars/AdminCalendarPage';
import AppointmentsPage from './views/Appointment/AppointmentsPage';
import WaitingRoom from './views/WaitingRoom/WaitingRoom';
import HistoryPage from './views/History/HistoryPage';
import ReportsPage from './views/Reports/ReportsPage';
import AdminProfessionalCalendarPage from './views/Admin/Calendars/AdminProfessionalCalendarPage';
import PatientPage from './views/Patient/PatientPage';
import WaitingRoomIssues from './views/Reports/WaitingRoomIssues';
import AssignUserPage from './views/Admin/Users/AssignUserPage';
import FeedbackPage from './views/Feedback/FeedbackPage';
import ThankYouPage from './views/Feedback/ThankYouPage';
import PrivacyPolicyPage from './views/Privacy/PrivacyPolicyPage';
import AdminAppointmentsPage from './views/Admin/Appointments/AdminAppointmentsPage';
import AdminUsersPage from './views/Admin/Users/AdminUsersPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/calendars" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function PrivateApp() {
  const { isLoading } = useAuth();

  return (
    <SidebarProvider>
      <div className='flex h-screen overflow-hidden w-full'>
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {isLoading ? (
              <></>
            ) : (
              <Routes>
                <Route path={ROUTES.HOME.path} element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path={ROUTES.CALENDAR.path} element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                <Route path={ROUTES.MEETING.path} element={<PrivateRoute><MeetingPage /></PrivateRoute>} />
                <Route path="/meeting/:appointmentId" element={<PrivateRoute><MeetingPage /></PrivateRoute>} />
                <Route path={ROUTES.SETTINGS.path} element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path={ROUTES.APPOINTMENTS.path} element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
                <Route path={ROUTES.HISTORY.path} element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path={ROUTES.WAITING_ROOM_ISSUES.path} element={<PrivateRoute><WaitingRoomIssues /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
                <Route path="/patient/:patientRut" element={<PrivateRoute><PatientPage /></PrivateRoute>} />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <Routes>
                      <Route path="dashboard" element={<div>Panel de Administración</div>} />
                      <Route path="calendars" element={<AdminCalendarPage />} />
                      <Route path="professional-calendar" element={<AdminProfessionalCalendarPage />} />
                      <Route path="assign-user" element={<AssignUserPage />} />
                      <Route path="appointments" element={<AdminAppointmentsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                    </Routes>
                  </AdminRoute>
                } />
                <Route path="/feedback/:appointmentId" element={<PrivateRoute><FeedbackPage /></PrivateRoute>} />
                <Route path="/feedback/thanks" element={<PrivateRoute><ThankYouPage /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='absolute left-2 bottom-2'>
        <p className='text-xs text-gray-500'>v1.1.1</p>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

// Componente separado para las rutas que puede usar useAuth
function AppRoutes() {
  const { user, isLoading } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas (siempre accesibles) */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/waiting-room/:appointmentId" element={<WaitingRoom />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Página de login - redirige a /home si hay usuario */}
      <Route path="/" element={
        isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
              <p>Por favor espere mientras verificamos su sesión.</p>
            </div>
          </div>
        ) : user ? (
          <Navigate to="/home" replace />
        ) : (
          <LoginPage />
        )
      } />

      {/* Rutas protegidas y de feedback */}
      <Route path="/feedback/:appointmentId" element={<FeedbackPage />} />
      <Route path="/feedback/thanks" element={<ThankYouPage />} />

      {/* Todas las demás rutas requieren autenticación */}
      <Route path="/*" element={
        isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
              <p>Por favor espere mientras verificamos su sesión.</p>
            </div>
          </div>
        ) : !user ? (
          <Navigate to="/" replace />
        ) : (
          <PrivateApp />
        )
      } />
    </Routes>
  );
}

export default App
