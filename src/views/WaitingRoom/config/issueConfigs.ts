import { WaitingRoomIssueType, WaitingRoomIssueStatus } from '@/services/waiting-room/types';

export const issueTypeConfig = {
  [WaitingRoomIssueType.AUDIO_ISSUES]: {
    label: "Problemas de Audio",
    color: "bg-blue-100 text-blue-700",
    icon: "🔊"
  },
  [WaitingRoomIssueType.VIDEO_ISSUES]: {
    label: "Problemas de Video",
    color: "bg-purple-100 text-purple-700",
    icon: "📹"
  },
  [WaitingRoomIssueType.CONNECTION_ISSUES]: {
    label: "Problemas de Conexión",
    color: "bg-orange-100 text-orange-700",
    icon: "🌐"
  },
  [WaitingRoomIssueType.PROFESSIONAL_NOT_PRESENT]: {
    label: "Profesional Ausente",
    color: "bg-red-100 text-red-700",
    icon: "⚠️"
  },
  [WaitingRoomIssueType.OTHER]: {
    label: "Otro",
    color: "bg-gray-100 text-gray-700",
    icon: "❓"
  }
} as const;

export const issueStatusConfig = {
  [WaitingRoomIssueStatus.PENDING]: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700"
  },
  [WaitingRoomIssueStatus.IN_PROGRESS]: {
    label: "En Progreso",
    color: "bg-blue-100 text-blue-700"
  },
  [WaitingRoomIssueStatus.RESOLVED]: {
    label: "Resuelto",
    color: "bg-green-100 text-green-700"
  },
  [WaitingRoomIssueStatus.CLOSED]: {
    label: "Cerrado",
    color: "bg-gray-100 text-gray-700"
  }
} as const;