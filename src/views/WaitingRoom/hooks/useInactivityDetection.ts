import { useEffect, useRef, useState } from 'react';

interface UseInactivityDetectionProps {
  inactivityTimeout?: number; // Tiempo en ms antes de mostrar verificación de presencia
  presenceCheckTimeout?: number; // Tiempo en ms para responder a la verificación
  onInactivityDetected?: () => void;
  onPresenceCheckExpired?: () => void;
}

export function useInactivityDetection({
  inactivityTimeout = 900000, // 15 minutos por defecto
  presenceCheckTimeout = 120000, // 2 minutos por defecto
  onInactivityDetected,
  onPresenceCheckExpired
}: UseInactivityDetectionProps) {
  const [showPresenceCheck, setShowPresenceCheck] = useState(false);
  const lastActivityTime = useRef<number>(Date.now());
  const inactivityTimeoutRef = useRef<number | null>(null);
  const presenceCheckTimeoutRef = useRef<number | null>(null);

  // Función para reiniciar el timer de inactividad
  const resetInactivityTimer = () => {
    lastActivityTime.current = Date.now();

    // Limpiar timeout existente
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    // Configurar nuevo timeout
    inactivityTimeoutRef.current = window.setTimeout(() => {
      setShowPresenceCheck(true);

      if (onInactivityDetected) {
        onInactivityDetected();
      }

      // Configurar timeout para la verificación de presencia
      presenceCheckTimeoutRef.current = window.setTimeout(() => {
        setShowPresenceCheck(false);

        if (onPresenceCheckExpired) {
          onPresenceCheckExpired();
        }
      }, presenceCheckTimeout);
    }, inactivityTimeout);
  };

  // Registrar actividad del usuario
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Confirmar presencia del usuario
  const confirmPresence = () => {
    setShowPresenceCheck(false);

    if (presenceCheckTimeoutRef.current) {
      window.clearTimeout(presenceCheckTimeoutRef.current);
      presenceCheckTimeoutRef.current = null;
    }

    resetInactivityTimer();
  };

  // Configurar listeners de eventos de actividad
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Registrar todos los eventos
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Iniciar el timer
    resetInactivityTimer();

    // Limpiar al desmontar
    return () => {
      // Eliminar eventos
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });

      // Limpiar timeouts
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }

      if (presenceCheckTimeoutRef.current) {
        window.clearTimeout(presenceCheckTimeoutRef.current);
      }
    };
  }, [inactivityTimeout, presenceCheckTimeout]);

  return {
    showPresenceCheck,
    confirmPresence
  };
}