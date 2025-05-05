import axios from 'axios';
import { StorageService } from '../storage/localStorage';

axios.defaults.withCredentials = true;

const calendarApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_SERVICE_URL,
  withCredentials: true,
});

const INACTIVITY_TIME = 0.5 * 60 * 60 * 1000; // 0.5 horas en milisegundos
let lastActivityTimestamp = Date.now();

// Función para verificar inactividad
const checkInactivity = () => {
  const now = Date.now();
  const inactiveTime = now - lastActivityTimestamp;

  if (inactiveTime > INACTIVITY_TIME) {
    StorageService.removeToken();
    StorageService.removeRefreshToken();
    window.location.href = '/login';
    return true;
  }
  return false;
};

// Interceptor para añadir el token a todas las peticiones
calendarApi.interceptors.request.use(
  (config) => {
    // Verificar inactividad antes de cada request
    console.log("Request:", config.url)
    if (checkInactivity()) {
      return Promise.reject('Session expired due to inactivity');
    }

    const token = StorageService.getToken();
    if (token)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

calendarApi.interceptors.response.use(
  (response) => {
    // Actualizar timestamp en cada respuesta exitosa
    lastActivityTimestamp = Date.now();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Intentando refresh del token...');
      originalRequest._retry = true;

      try {
        const refreshToken = StorageService.getRefreshToken();

        if (!refreshToken) {
          console.log('❌ No hay refresh token disponible');
          throw new Error('No refresh token available');
        }

        // Verificar inactividad antes de intentar refresh
        if (checkInactivity()) {
          throw new Error('Session expired due to inactivity');
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_SERVICE_URL}/auth/refresh`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        StorageService.setToken(accessToken);
        StorageService.setRefreshToken(newRefreshToken);

        // Actualizar timestamp después de refresh exitoso
        lastActivityTimestamp = Date.now();

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return calendarApi(originalRequest);

      } catch (refreshError) {
        console.error('❌ Error durante el refresh:', refreshError);
        StorageService.removeToken();
        StorageService.removeRefreshToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('❌ Error en la respuesta:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default calendarApi;