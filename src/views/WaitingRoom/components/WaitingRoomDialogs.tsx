import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WaitingRoomDialogsProps {
  showPresenceCheck: boolean;
  showReconnectDialog: boolean;
  onPresenceConfirm: () => void;
  onReconnect: () => void;
  onPresenceDialogOpenChange: (open: boolean) => void;
  onReconnectDialogOpenChange: (open: boolean) => void;
}

export function WaitingRoomDialogs({
  showPresenceCheck,
  showReconnectDialog,
  onPresenceConfirm,
  onReconnect,
  onPresenceDialogOpenChange,
  onReconnectDialogOpenChange,
}: WaitingRoomDialogsProps) {
  return (
    <>
      <Dialog open={showPresenceCheck} onOpenChange={onPresenceDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Sigues ahí?</DialogTitle>
            <DialogDescription>
              Hemos notado que no ha habido actividad en los últimos 15 minutos.
              Por favor, confirma tu presencia para mantener la conexión activa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onPresenceConfirm}>
              Sí, sigo aquí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReconnectDialog} onOpenChange={onReconnectDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conexión interrumpida</DialogTitle>
            <DialogDescription>
              Debido a la inactividad prolongada, la conexión se ha interrumpido.
              Para continuar, necesitas recargar la página.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onReconnect}>
              Recargar página
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}