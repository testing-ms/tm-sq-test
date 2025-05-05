interface StatusUpdate {
  type: 'STATUS_UPDATE';
  appointmentId: string;
  professionalId: string;
  status: string;
  timestamp: string;
}

interface AppointmentCallbacks {
  onStatusChange?: (status: string) => void;
}

export class AppointmentNotificationService {
  private eventSource: EventSource | null = null;
  private appointmentId: string | null = null;
  private callbacks: AppointmentCallbacks = {};

  constructor() {
    // No inicializamos EventSource en el constructor
  }

  listenForAppointmentUpdates(
    appointmentId: string,
    callbacks: AppointmentCallbacks
  ) {
    this.appointmentId = appointmentId;
    this.callbacks = callbacks;

    // Cerrar conexión existente si la hay
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Crear nueva conexión SSE
    const url = `${import.meta.env.VITE_BACKEND_SERVICE_URL}/status/${appointmentId}/status-updates`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {};

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StatusUpdate;
        // Solo procesar actualizaciones de estado para nuestra cita específica
        if (data.appointmentId === this.appointmentId && this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange(data.status);
        }
      } catch (error) {
        console.error('[SSE] Error al procesar mensaje:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('[SSE] Error en la conexión:', {
        error,
        readyState: this.getReadyStateString(this.eventSource?.readyState),
        timestamp: new Date().toISOString()
      });

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          this.listenForAppointmentUpdates(appointmentId, callbacks);
        }, 5000);
      }
    };
  }

  private getReadyStateString(readyState: number | undefined): string {
    switch (readyState) {
      case EventSource.CONNECTING:
        return 'CONNECTING (0)';
      case EventSource.OPEN:
        return 'OPEN (1)';
      case EventSource.CLOSED:
        return 'CLOSED (2)';
      default:
        return `UNKNOWN (${readyState})`;
    }
  }

  stopListening() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.appointmentId = null;
    this.callbacks = {};
  }

  // Método para verificar si la conexión SSE está activa
  isListening(): boolean {
    return this.eventSource !== null && this.eventSource.readyState !== EventSource.CLOSED;
  }
}