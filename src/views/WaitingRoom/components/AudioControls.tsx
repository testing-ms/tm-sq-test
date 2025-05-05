import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, Volume2, VolumeX } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  isAudioLoading: boolean;
  isMuted: boolean;
  volume: number;
  startAudio: () => void;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
}

export function AudioControls({
  isPlaying,
  isAudioLoading,
  isMuted,
  volume,
  startAudio,
  toggleMute,
  handleVolumeChange,
}: AudioControlsProps) {
  return (
    <>
      <div className="flex items-center gap-4 px-4">
        {isAudioLoading ? (
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="shrink-0"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </Button>
        ) : !isPlaying ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={startAudio}
            className="shrink-0"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        )}
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
          disabled={isAudioLoading || !isPlaying}
        />
      </div>

      {!isPlaying && !isAudioLoading && (
        <p className="text-xs text-center text-muted-foreground">
          Haga clic en el botón para reproducir música de fondo
        </p>
      )}
    </>
  );
}