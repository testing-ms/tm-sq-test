import { useState, useRef, useEffect } from 'react';

export function useAudio(audioSrc: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // Volumen inicial al 50%
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear elemento de audio
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Añadir listeners
    audio.addEventListener('canplaythrough', () => {
      setIsAudioLoading(false);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    // Limpiar al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioSrc]);

  // Iniciar reproducción de audio
  const startAudio = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .catch(error => {
          console.error('Error al reproducir audio:', error);
        });
    }
  };

  // Alternar estado de silencio
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Ajustar volumen
  const handleVolumeChange = (newVolume: number[]) => {
    if (audioRef.current && newVolume.length > 0) {
      const volumeValue = newVolume[0];
      audioRef.current.volume = volumeValue;
      setVolume(volumeValue);
    }
  };

  return {
    isPlaying,
    isAudioLoading,
    isMuted,
    volume,
    startAudio,
    toggleMute,
    handleVolumeChange
  };
}