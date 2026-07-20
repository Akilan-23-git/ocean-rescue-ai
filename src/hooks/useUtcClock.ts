import { useState, useEffect } from 'react';
import { formatUtcTime } from '@/utils';

export function useUtcClock(intervalMs = 1000) {
  const [utcTime, setUtcTime] = useState(formatUtcTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(formatUtcTime());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return utcTime;
}
