import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '@/features/mission/services/missionService';
import { simulationService } from '../services/simulationService';
import type { SimulationConfig } from '@/types/simulation';
import type { Coordinates } from '@/types';

const MISSIONS_KEY = ['missions'];

export function useSaveSimulationConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ missionId, config }: { missionId: string; config: SimulationConfig }) =>
      missionService.update(missionId, { simulationConfig: config }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useRunSimulation() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      missionId,
      origin,
      config,
    }: {
      missionId: string;
      origin: Coordinates;
      config: SimulationConfig;
    }) => {
      setProgress(0);
      missionService.update(missionId, { status: 'simulating', simulationConfig: config });
      const result = await simulationService.simulateWithProgress(origin, config, setProgress);
      const searchArea = simulationService.generateSearchArea(origin, result);
      return missionService.update(missionId, {
        status: 'active',
        simulationResult: result,
        searchArea,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });

  const resetProgress = useCallback(() => setProgress(0), []);

  return { ...mutation, progress, resetProgress };
}
