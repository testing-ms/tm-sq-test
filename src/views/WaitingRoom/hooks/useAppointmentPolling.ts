import { useEffect, useRef, useState } from 'react';
import { AppointmentsService, QueuePosition } from '@/services/appointments/queries';
import { AppointmentNotificationService } from '@/services/appointments/notifications';
import { toast } from 'sonner';

interface AppointmentStatus {
  status: string;
  meetLink?: string;
  remainingTime?: number;
}

interface UseAppointmentPollingProps {
  appointmentId: string;
  onStatusChange: (status: AppointmentStatus) => void;
  onFinished: () => void;
  reducedPollingWhenInProgress?: boolean;
}

export function useAppointmentPolling({
  appointmentId,
  onStatusChange,
  onFinished,
  reducedPollingWhenInProgress = true
}: UseAppointmentPollingProps) {
  const [queueInfo, setQueueInfo] = useState<QueuePosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);

  const notificationService = useRef<AppointmentNotificationService | null>(null);
  const pollingInterval = useRef<number | null>(null);

  // Función para detener completamente el polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Función para obtener posición en la cola
  const fetchQueuePosition = async () => {
    if (isFinished) return;

    if (reducedPollingWhenInProgress) {
      return;
    }

    // Verificar si falta mucho tiempo para la consulta
    if (remainingTime !== null && remainingTime > 120) {
      updatePollingFrequency();
      return;
    }

    try {
      const data = await AppointmentsService.getQueuePosition(appointmentId);
      setQueueInfo(data);

      // Si somos el paciente actual, verificar el estado
      if (data.currentPatient) {
        checkAppointmentStatus();
      }
    } catch (error) {
      console.error('Error al obtener posición en cola:', error);
      toast.error('Error al obtener información de la cola');
      setError('No se pudo obtener la posición en la cola');
    }
  };

  const checkAppointmentStatus = async () => {
    try {
      const data = await AppointmentsService.getRoomStatus(appointmentId);

      // Actualizar tiempo restante si está disponible
      if (data.remainingTime !== undefined) {
        setRemainingTime(data.remainingTime);
      }

      if (data.status === 'IN_PROGRESS') {
        console.log("data.status", data.status)
        // Si pasamos a estado IN_PROGRESS, detener el polling inmediatamente
        if (!isInProgress) {
          setIsInProgress(true);
          // Detener polling inmediatamente
          stopPolling();

          onStatusChange({
            status: data.status,
            meetLink: data.meetLink,
            remainingTime: data.remainingTime
          });
        }
      } else if (data.status === 'FINISHED') {
        setIsFinished(true);
        setIsInProgress(false);
        onFinished();
        stopAllPolling();
      }

      // Ajustar la frecuencia de polling según el tiempo restante
      updatePollingFrequency();
    } catch (error) {
      console.error('Error al verificar estado de la cita:', error);
      toast.error('Error al verificar el estado de la cita');
      setError('No se pudo verificar el estado de la cita');
    }
  };

  // Detener todo tipo de polling y escucha
  const stopAllPolling = () => {
    stopPolling();

    if (notificationService.current) {
      notificationService.current.stopListening();
    }
  };

  // Función para actualizar la frecuencia de polling según el tiempo restante
  const updatePollingFrequency = () => {
    // No configurar polling si está en progreso
    if (isInProgress && reducedPollingWhenInProgress) {
      stopPolling(); // Asegurarse de detener cualquier polling existente
      ensureNotificationServiceActive(); // Mantener SSE activo
      return;
    }

    // Limpiar intervalo existente
    stopPolling();

    if (isFinished) return;

    let interval = 30000; // Valor predeterminado: 30 segundos
    console.log("remainingTime", remainingTime)
    // Ajustar intervalo según tiempo restante
    if (remainingTime !== null) {
      if (remainingTime > 120) { // Más de 2 horas
        // Detener la conexión SSE
        if (notificationService.current) {
          notificationService.current.stopListening();
        }
        return; // No programar nuevo intervalo
      } else if (remainingTime > 60) { // Entre 1 y 2 horas
        interval = 300000; // 5 minutos
      } else if (remainingTime > 10) { // Entre 10 y 60 minutos
        interval = 60000; // 1 minuto
      }
      // Para menos de 10 minutos, usar el predeterminado de 30 segundos
    }

    // Asegurarse que el servicio de notificaciones esté activo
    ensureNotificationServiceActive();

    // Solo configurar nuevo intervalo si NO estamos en progreso
    if (!isInProgress || !reducedPollingWhenInProgress) {
      pollingInterval.current = window.setInterval(fetchQueuePosition, interval);
    }
  };

  // Asegurar que el servicio de notificaciones esté activo
  const ensureNotificationServiceActive = () => {
    if (!notificationService.current) {
      notificationService.current = new AppointmentNotificationService();
    }

    if (!notificationService.current.isListening()) {
      notificationService.current.listenForAppointmentUpdates(appointmentId, {
        onStatusChange: (status) => {
          if (status === 'IN_PROGRESS') {
            setIsInProgress(true);
            // Detener polling inmediatamente al recibir notificación
            stopPolling();
            checkAppointmentStatus();
          } else if (status === 'FINISHED') {
            checkAppointmentStatus();
          }
        }
      });
    }
  };

  // Inicializar polling y servicio de notificaciones
  useEffect(() => {
    if (!appointmentId) {
      setError('ID de cita no válido');
      return;
    }

    // Iniciar servicio de notificaciones
    notificationService.current = new AppointmentNotificationService();

    ensureNotificationServiceActive();

    // Verificar estado inicial
    checkAppointmentStatus();

    // Solo iniciar polling si NO estamos en estado IN_PROGRESS
    if (!isInProgress && !isFinished) {
      fetchQueuePosition();
      pollingInterval.current = window.setInterval(fetchQueuePosition, 30000);
    }

    // Limpiar al desmontar
    return () => {
      stopAllPolling();
    };
  }, []);

  // Efecto específico para detener el polling cuando cambia isInProgress
  useEffect(() => {
    if (isInProgress && reducedPollingWhenInProgress) {
      // Detener cualquier polling existente cuando pasa a IN_PROGRESS
      stopPolling();
      // Asegurar que SSE está activo
      ensureNotificationServiceActive();
    }
  }, [isInProgress]);

  // Efecto para actualizar el polling cuando cambia el tiempo restante o finaliza
  useEffect(() => {
    if (!isInProgress || !reducedPollingWhenInProgress) {
      updatePollingFrequency();
    }
  }, [remainingTime, isFinished]);

  return {
    queueInfo,
    error,
    remainingTime,
    isFinished,
    isInProgress,
    refetchStatus: checkAppointmentStatus
  };
}