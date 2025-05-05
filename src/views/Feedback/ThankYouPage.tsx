import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">
            ¡Gracias por tu feedback!
          </h1>
          <p className="text-muted-foreground">
            Tu opinión nos ayuda a seguir mejorando nuestro servicio.
          </p>
        </div>
        <Button
          onClick={() => window.close()}
          className="w-full"
        >
          Cerrar ventana
        </Button>
      </Card>
    </div>
  );
}