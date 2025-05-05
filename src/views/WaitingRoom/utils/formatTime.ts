export const formatTime = (minutes: number) => {
  if (minutes < 1) return 'menos de un minuto';
  if (minutes === 1) return '1 minuto';
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainingMinutes} minutos`;
};