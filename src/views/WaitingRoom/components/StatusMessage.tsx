import { Button } from '@/components/ui/button';
import { IdentificationMessage } from './IdentificationMessage';

interface StatusMessageProps {
  isReady: boolean;
  hasIdCard: boolean;
  meetLink: string | null;
  onJoinMeeting?: () => void;
}

export function StatusMessage({ isReady, hasIdCard, meetLink, onJoinMeeting }: StatusMessageProps) {
  const handleJoinMeeting = () => {
    if (meetLink) {
      window.open(meetLink, '_blank');

      // Notificar al componente padre que el paciente se unió
      if (onJoinMeeting) onJoinMeeting();
    }
  };

  return (
    <div className="space-y-4 text-center">
      {isReady ? (
        <>
          <p className="text-green-600 font-medium">
            ¡El profesional está listo para atenderle!
          </p>
          {hasIdCard ? (
            <Button
              className="w-full"
              onClick={handleJoinMeeting}
            >
              Unirse a la consulta
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full"
                disabled
              >
                Unirse a la consulta
              </Button>
              <IdentificationMessage isReady={true} />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Le notificaremos cuando el profesional esté listo
          </p>
          {!hasIdCard && <IdentificationMessage isReady={false} />}
          <div className="text-xs text-muted-foreground">
            No cierre esta ventana
          </div>
        </div>
      )}
    </div>
  );
}