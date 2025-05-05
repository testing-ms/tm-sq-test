import { useState, useEffect } from "react";

interface CurrentTimeLineProps {
  blockSize: number;
  startHour?: number;
}

export function CurrentTimeLine({ blockSize, startHour = 7 }: CurrentTimeLineProps) {
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    const calculatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const totalMinutes = hours * 60 + minutes;

      const minutesFromStart = totalMinutes - (startHour * 60);

      if (minutesFromStart < 0) return 0;

      const blockHeight = 48; // px
      const blocksPerHour = 60 / blockSize;
      const pixelsPerHour = blockHeight * blocksPerHour;

      const position = (minutesFromStart / 60) * pixelsPerHour;

      return position;
    };

    setPosition(calculatePosition());

    const interval = setInterval(() => {
      setPosition(calculatePosition());
    }, 60000);

    return () => clearInterval(interval);
  }, [blockSize, startHour]);

  if (position <= 0) return null;

  return (
    <div
      className="absolute w-full z-10 pointer-events-none"
      style={{
        top: `${position}px`,
        left: 0,
      }}
    >
      <div className="relative w-full flex items-center">
        <div className="absolute left-0 w-2 h-2 bg-green-600/50 rounded-full -translate-x-1" />
        <div className="w-full h-[2px] bg-green-600/50" />
      </div>
    </div>
  );
}