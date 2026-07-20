import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Mission } from '@/types';
import { missionService } from '@/features/mission/services/missionService';

interface MissionContextValue {
  currentMission: Mission | null;
  setCurrentMission: (mission: Mission | null) => void;
  loadMission: (id: string) => Mission | undefined;
  refreshMission: (id: string) => void;
}

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  const loadMission = useCallback((id: string) => {
    return missionService.getById(id);
  }, []);

  const refreshMission = useCallback((id: string) => {
    const mission = missionService.getById(id);
    if (mission) setCurrentMission(mission);
  }, []);

  return (
    <MissionContext.Provider
      value={{ currentMission, setCurrentMission, loadMission, refreshMission }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMissionContext() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMissionContext must be used within MissionProvider');
  return ctx;
}
