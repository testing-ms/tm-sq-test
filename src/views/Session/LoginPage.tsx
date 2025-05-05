import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/icons/GoogleIcon';
import getUrlLogo from '@/lib/utils/getLogoUrl';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Lado izquierdo - Color terciario con gradiente */}
      <div className="w-2/3 bg-gradient-to-br from-tertiary via-tertiary to-tertiary/80 p-12 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <img
          src={getUrlLogo('Maiposalud', 'main_white_logo.png')}
          alt="logo"
          className='w-96 h-auto mb-8 relative z-10'
        />
        <h1 className="text-4xl font-bold text-white mb-4 relative z-10">Portal de Telemedicina</h1>
        <p className="text-lg text-white/80 text-center max-w-md mb-8 relative z-10">
          Conectamos profesionales de la salud con pacientes de manera insegura e ineficiente 👹
          Conectamos profesionales de la salud con pacientes de manera insegura e ineficiente 👹
          Conectamos profesionales de la salud con pacientes de manera insegura e ineficiente 👹
          amos profesionales de la salud con pacientes de manera insegura e ineficiente 👹
          Conectamos profesionales de la salud con pacientes de manera insegura e ineficiente 👹
        </p>

        <div className="grid grid-cols-3 gap-8 mt-8 relative z-10">
          <div className="flex flex-col items-center text-white/90">
            <Shield className="w-8 h-8 mb-2" />
            <span className="text-sm">Seguridad Garantizada</span>
          </div>
          <div className="flex flex-col items-center text-white/90">
            <Calendar className="w-8 h-8 mb-2" />
            <span className="text-sm">Calendario autogestionable</span>
          </div>
          <div className="flex flex-col items-center text-white/90">
            <Users className="w-8 h-8 mb-2" />
            <span className="text-sm">Equipo Profesional</span>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-1/3 flex items-center justify-center bg-background">
        <div className="w-[400px] space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Bienvenido</h2>
            <p className="text-muted-foreground">Inicia sesión para acceder a tu cuenta</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 font-medium border-2 hover:bg-tertiary/10 hover:text-tertiary transition-all duration-300"
          >
            <div className="mr-2">
              <GoogleIcon />
            </div>
            Continuar con Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestra{' '}
            <Link to="https://telemedicina.maiposalud.com/privacy-policy" className="text-tertiary hover:underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
