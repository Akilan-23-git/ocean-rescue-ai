import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRemoteMissions } from '@/services/emergencyApi';
import { missionService } from '@/features/mission/services/missionService';
import { MISSIONS_KEY } from '@/features/mission/hooks/useMissions';
import type { Mission } from '@/types';

interface EmergencyContextValue {
  latestAlert: Mission | null;
  dismissAlert: () => void;
  activeEmergencyCount: number;
}

const EmergencyContext = createContext<EmergencyContextValue | null>(null);

const SEEN_KEY = 'msar_seen_sms_mission_ids';

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [latestAlert, setLatestAlert] = useState<Mission | null>(null);
  const [emergencyTick, setEmergencyTick] = useState(0);
  const seenRef = useRef<Set<string>>(loadSeen());

  const { data: remote = [] } = useQuery({
    queryKey: ['remote-missions'],
    queryFn: fetchRemoteMissions,
    refetchInterval: 5000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!remote.length) return;
    const { added } = missionService.syncRemoteMissions(remote);
    void queryClient.invalidateQueries({ queryKey: MISSIONS_KEY });
    setEmergencyTick((t) => t + 1);

    const fresh = added.filter(
      (m) =>
        (m.triggerType === 'SMS' || m.triggerType === 'SOS_DEVICE') &&
        !seenRef.current.has(m.missionId),
    );
    if (fresh.length > 0) {
      setLatestAlert(fresh[0]);
      fresh.forEach((m) => seenRef.current.add(m.missionId));
      saveSeen(seenRef.current);
    }
  }, [remote, queryClient]);

  const dismissAlert = useCallback(() => setLatestAlert(null), []);

  const activeEmergencyCount = useMemo(() => {
    void emergencyTick;
    return missionService.getActiveEmergencies().length;
  }, [emergencyTick]);

  const value = useMemo(
    () => ({ latestAlert, dismissAlert, activeEmergencyCount }),
    [latestAlert, dismissAlert, activeEmergencyCount],
  );

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergencyAlerts() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergencyAlerts must be used within EmergencyProvider');
  return ctx;
}
