import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '@/features/mission/services/missionService';
import { liveTrackingService } from '../services/trackingService';
import type { LiveTrackingState } from '@/types/tracking';
import type { Mission } from '@/types';

const MISSIONS_KEY = ['missions'];
const TICK_MS = 800;
const HOUR_PER_TICK = 0.25;

export function useLiveTracking(mission: Mission | undefined) {
  const queryClient = useQueryClient();
  const [tracking, setTracking] = useState<LiveTrackingState | null>(
    mission?.liveTracking ?? null,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (mission?.liveTracking) setTracking(mission.liveTracking);
    else if (mission && !tracking) {
      const initial = liveTrackingService.createInitialState(mission);
      if (initial) setTracking(initial);
    }
  }, [mission?.id]);

  const persist = useMutation({
    mutationFn: async (state: LiveTrackingState) => {
      if (!mission) return;
      return missionService.update(mission.id, { liveTracking: state });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });

  const update = useCallback(
    (updater: (prev: LiveTrackingState) => LiveTrackingState) => {
      setTracking((prev) => {
        if (!prev || !mission) return prev;
        const next = updater(prev);
        persist.mutate(next);
        return next;
      });
    },
    [mission, persist],
  );

  const start = useCallback(() => {
    if (!mission) return;
    update((prev) => ({
      ...prev,
      status: 'running',
      startedAt: prev.startedAt ?? new Date().toISOString(),
      pausedAt: null,
    }));
  }, [mission, update]);

  const pause = useCallback(() => {
    update((prev) => ({ ...prev, status: 'paused', pausedAt: new Date().toISOString() }));
  }, [update]);

  const resume = useCallback(() => {
    update((prev) => ({ ...prev, status: 'running', pausedAt: null }));
  }, [update]);

  const replay = useCallback(() => {
    if (!mission?.lastKnownPosition) return;
    update((prev) => ({
      ...prev,
      status: 'replaying',
      currentHour: 0,
      currentPosition: { ...mission.lastKnownPosition! },
      startedAt: new Date().toISOString(),
      pausedAt: null,
    }));
  }, [mission, update]);

  const toggleAutoRefresh = useCallback(() => {
    update((prev) => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, [update]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!mission || !tracking) return;
    if (tracking.status !== 'running' && tracking.status !== 'replaying') return;

    intervalRef.current = setInterval(() => {
      setTracking((prev) => {
        if (!prev || !mission) return prev;
        const next = liveTrackingService.tick(prev, mission, HOUR_PER_TICK);
        if (next.currentHour !== prev.currentHour) {
          persist.mutate(next);
        }
        return next;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tracking?.status, mission?.id]);

  const remainingMs = tracking?.countdownEndsAt
    ? Math.max(0, new Date(tracking.countdownEndsAt).getTime() - Date.now())
    : 0;

  return {
    tracking,
    remainingMs,
    start,
    pause,
    resume,
    replay,
    toggleAutoRefresh,
    isActive: tracking?.status === 'running' || tracking?.status === 'replaying',
  };
}
