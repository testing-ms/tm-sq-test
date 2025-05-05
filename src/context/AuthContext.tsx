import { SessionService } from '@/services/Session/queries';
import { ProfessionalInfo } from '@/services/Session/types';
import { StorageService } from '@/services/storage/localStorage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserQueries } from '@/services/users/queries';

interface AuthContextType {
  user: ProfessionalInfo | null;
  loginWithGoogle: () => void;
  handleGoogleCallback: () => Promise<void>;
  logout: () => void;
  getUserInfoLoading: boolean;
  isLoading: boolean;
  setUser: (user: ProfessionalInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfessionalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: getUserInfoAsync, isPending: getUserInfoLoading } = useMutation({
    mutationFn: SessionService.getUserInfo,
    onSuccess: async (data) => {
      if (!data.externalProfessionalId && data.email) {
        try {
          const professionalId = await SessionService.getProfessionalId(data.email);
          const professionalIdString = String(professionalId);
          if (professionalIdString !== 'user no found') {
            await UserQueries.editUser({ externalProfessionalId: professionalIdString });
            setUser({ ...data, externalProfessionalId: professionalIdString });
          } else {
            setUser(data);
          }
        } catch (error) {
          console.error('Error al obtener/guardar el ID profesional:', error);
          setUser(data);
        }
      } else {
        setUser(data);
      }
    },
    onError: () => {
      setUser(null);
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = StorageService.getToken();
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const { isAuthenticated } = await SessionService.checkAuth();
        if (isAuthenticated) {
          await getUserInfoAsync();
        } else {
          StorageService.removeToken();
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        StorageService.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_SERVICE_URL}/auth/google/login`;
  };

  const logout = () => {
    setUser(null);
    StorageService.removeToken();
    queryClient.clear();
    SessionService.logout();
    navigate('/');
  };

  const handleGoogleCallback = async () => {
    try {
      await getUserInfoAsync();
    } catch (error) {
      console.error('Error en el callback de Google:', error);
      StorageService.removeToken();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginWithGoogle,
      handleGoogleCallback,
      logout,
      isLoading,
      getUserInfoLoading,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};