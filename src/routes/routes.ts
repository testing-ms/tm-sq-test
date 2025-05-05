import { Calendar, Settings, MessageSquareText, Video, Calendar1Icon, Clock, User, Stethoscope, AlertCircle, Shield, Calendar1 } from "lucide-react";

export const USER_ROUTES = {
  LOGIN: {
    path: "/login",
    title: "Login",
    icon: MessageSquareText,
    visible: false
  },
  HOME: {
    path: "/home",
    title: "Menú",
    icon: Stethoscope,
    visible: true
  },
  CALENDAR: {
    path: "/calendar",
    title: "Calendario",
    icon: Calendar,
    visible: true
  },
  APPOINTMENTS: {
    path: "/appointments",
    title: "Citas",
    icon: Calendar1Icon,
    visible: true
  },
  MEETING: {
    path: "/meeting",
    title: "Reunión",
    icon: Video,
    visible: false
  },
  HISTORY: {
    path: "/history",
    title: "Historial",
    icon: Clock,
    visible: true
  },
  WAITING_ROOM_ISSUES: {
    path: "/waiting-room-issues",
    title: "Reportes",
    icon: AlertCircle,
    visible: true
  },
  SETTINGS: {
    path: "/settings",
    title: "Configuración",
    icon: Settings,
    visible: true
  },
  PATIENT: {
    path: "/patient/:patientRut",
    title: "Perfil del Paciente",
    icon: User,
    visible: false
  },
  PRIVACY_POLICY: {
    path: "/privacy-policy",
    title: "Política de Privacidad",
    icon: Shield,
    visible: false
  }
};

export const ADMIN_ROUTES = {
  CALENDARS: {
    path: "/admin/calendars",
    title: "Calendarios",
    icon: Calendar,
    visible: true
  },
  PROFESSIONAL_CALENDAR: {
    path: "/admin/professional-calendar",
    title: "Calendario Profesional",
    icon: Calendar,
    visible: true
  },
  ASSIGN_USER: {
    path: "/admin/assign-user",
    title: "Asignar Usuario",
    icon: User,
    visible: true
  },
  APPOINTMENTS_ADMIN: {
    path: "/admin/appointments",
    title: "Administrar Citas",
    icon: Calendar1,
    visible: true
  },
  USERS_ADMIN: {
    path: "/admin/users",
    title: "Administrar Usuarios",
    icon: User,
    visible: true
  }
};

export const ROUTES = {
  ...USER_ROUTES,
  ...ADMIN_ROUTES
};


