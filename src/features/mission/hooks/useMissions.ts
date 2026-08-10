import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '@/features/mission/services/missionService';
import type { Mission, MissionFormData, MissionStatus } from '@/types';
import type { MissionOutcome } from '@/types/management';
import type { ReplaySnapshot } from '@/types/management';

export const MISSIONS_KEY = ['missions'];

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

export function useSetMissionStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    Mission | undefined,
    Error,
    { id: string; status: MissionStatus; outcome?: MissionOutcome }
  >({
    mutationFn: async ({ id, status, outcome }) => missionService.setStatus(id, status, outcome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useAddMissionNote() {
  const queryClient = useQueryClient();
  return useMutation<Mission | undefined, Error, { id: string; content: string }>({
    mutationFn: async ({ id, content }) => missionService.addNote(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useAddMissionAttachment() {
  const queryClient = useQueryClient();
  return useMutation<
    Mission | undefined,
    Error,
    { id: string; file: { name: string; type: string; size: number; dataUrl?: string } }
  >({
    mutationFn: async ({ id, file }) => missionService.addAttachment(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useSaveReplaySnapshot() {
  const queryClient = useQueryClient();
  return useMutation<Mission | undefined, Error, { id: string; snapshot: ReplaySnapshot }>({
    mutationFn: async ({ id, snapshot }) => {
      const mission = missionService.getById(id);
      if (!mission) return undefined;
      return missionService.update(id, {
        replaySnapshots: [...(mission.replaySnapshots ?? []), snapshot],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}
