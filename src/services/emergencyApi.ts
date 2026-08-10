import axios from 'axios';
import { FASTAPI_BASE_URL } from '@/constants';
import type { Mission } from '@/types';

const emergencyClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 15000,
});

export async function fetchRemoteMissions(): Promise<Mission[]> {
  const { data } = await emergencyClient.get<{ success: boolean; data: Mission[] }>('/missions');
  return (data.data ?? []).map(normalizeRemoteMission);
}

function normalizeRemoteMission(raw: Mission): Mission {
  return {
    ...raw,
    referencePoints: raw.referencePoints ?? [],
    timeline: raw.timeline ?? [],
    notes: raw.notes ?? [],
    attachments: raw.attachments ?? [],
    searchHistory: raw.searchHistory ?? [],
    triggerType: raw.triggerType ?? 'SMS',
    lifeJacketStatus: raw.lifeJacketStatus ?? 'unknown',
    outcome: raw.outcome ?? 'ongoing',
  };
}
