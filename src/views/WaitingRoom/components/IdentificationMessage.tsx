import { CreditCard } from 'lucide-react';

interface IdentificationMessageProps {
  isReady?: boolean;
}

export function IdentificationMessage({ isReady }: IdentificationMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <CreditCard className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className={`text-sm font-medium text-destructive ${!isReady ? 'text-xs' : ''}`}>
            Identificación requerida
          </p>
          <p className={`text-sm text-destructive/90 ${!isReady ? 'text-xs' : ''}`}>
            {isReady
              ? "Para unirte a la consulta, primero debes subir una foto de tu identificación"
              : "Recuerda: Debes subir una foto de tu identificación antes de poder unirte a la consulta"
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white/50 rounded p-2 ml-8">
        <span className="text-blue-500">💡</span>
        <p className="text-xs text-muted-foreground">
          Puedes abrir este mismo link en tu celular para tomar la foto más fácilmente
        </p>
      </div>
    </div>
  );
}