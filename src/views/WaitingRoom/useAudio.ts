import { useState, useRef, useEffect } from 'react';

interface AudioHookReturn {
  isPlaying: boolean;
  isAudioLoading: boolean;
  isMuted: boolean;
  volume: number;
  startAudio: () => Promise<void>;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
}

export function useAudio(audioPath: string): AudioHookReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeInterval = useRef<number | null>(null);

  const fadeInAudio = (audio: HTMLAudioElement, duration: number = 2000) => {
    audio.volume = 0;
    const increment = volume / (duration / 100); // Incrementar cada 100ms
    let currentVolume = 0;

    fadeInterval.current = window.setInterval(() => {
      currentVolume = Math.min(currentVolume + increment, volume);
      audio.volume = currentVolume;

      if (currentVolume >= volume) {
        if (fadeInterval.current) clearInterval(fadeInterval.current);
      }
    }, 100);
  };

  const startAudio = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
        setIsPlaying(true);
        fadeInAudio(audioRef.current);
      }
    } catch (error) {
      console.error('Error al reproducir audio:', error);
      setIsAudioLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  useEffect(() => {
    // Crear y precargar el audio
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = 0;

    const handleCanPlayThrough = () => {
      setIsAudioLoading(false);
    };

    const handleError = (error: ErrorEvent) => {
      console.error('Error al cargar audio:', error);
      setIsAudioLoading(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    return () => {
      if (fadeInterval.current) {
        clearInterval(fadeInterval.current);
      }
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioPath]);

  // Efecto para manejar cambios en el volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return {
    isPlaying,
    isAudioLoading,
    isMuted,
    volume,
    startAudio,
    toggleMute,
    handleVolumeChange,
  };
}