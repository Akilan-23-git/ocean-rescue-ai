import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '@/features/mission/services/missionService';
import type { Mission, MissionFormData } from '@/types';

const MISSIONS_KEY = ['missions'];

export function useMissions() {
  return useQuery({
    queryKey: MISSIONS_KEY,
    queryFn: () => missionService.getAll(),
  });
}

export function useMission(id: string | undefined) {
  return useQuery({
    queryKey: [...MISSIONS_KEY, id],
    queryFn: () => (id ? missionService.getById(id) : undefined),
    enabled: !!id,
  });
}

export function useCreateMissionDraft() {
  const queryClient = useQueryClient();
  return useMutation<Mission, Error, MissionFormData>({
    mutationFn: async (data) => missionService.createDraft(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  return useMutation<Mission | undefined, Error, { id: string; data: Partial<Mission> }>({
    mutationFn: async ({ id, data }) => missionService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useActivateMission() {
  const queryClient = useQueryClient();
  return useMutation<Mission | undefined, Error, string>({
    mutationFn: async (id) => missionService.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}
