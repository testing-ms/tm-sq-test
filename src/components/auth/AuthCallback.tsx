import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/services/storage/localStorage';
import { SessionService } from '@/services/Session/queries';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No se recibió el token de autenticación');
        }

        StorageService.setToken(token);

        await handleGoogleCallback();

        const userData = await SessionService.getUserInfo();

        if (userData.role === 'admin') {
          navigate('/admin/calendars', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }

      } catch (error) {
        console.error('Error en autenticación:', error);
        StorageService.removeToken();
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Autenticando...</h2>
        <p>Por favor espere mientras completamos el proceso.</p>
      </div>
    </div>
  );
}