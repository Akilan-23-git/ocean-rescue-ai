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

export interface SOSPayload {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  emergencyType: string;
  numberOfPeople: number;
  clientEventId: string;
}

export interface SOSApiResponse {
  success: boolean;
  duplicate: boolean;
  missionId: string | null;
  status: string | null;
  message: string;
  gpsAccuracyMeters: number | null;
  errors: string[];
}

export async function submitSosEmergency(payload: SOSPayload): Promise<SOSApiResponse> {
  const { data } = await emergencyClient.post<SOSApiResponse>('/emergency/sos', payload);
  return data;
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
    gpsAccuracy: raw.gpsAccuracy,
    deviceId: raw.deviceId,
    lifeJacketStatus: raw.lifeJacketStatus ?? 'unknown',
    outcome: raw.outcome ?? 'ongoing',
  };
}
