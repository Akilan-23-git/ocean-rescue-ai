import type { Mission, MissionFormData } from '@/types';
import { generateId } from '@/utils';

const STORAGE_KEY = 'msar_missions';

function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Mission[]) : [];
  } catch {
    return [];
  }
}

function saveMissions(missions: Mission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

export const missionService = {
  getAll(): Mission[] {
    return loadMissions();
  },

  getById(id: string): Mission | undefined {
    return loadMissions().find((m) => m.id === id);
  },

  getActive(): Mission[] {
    return loadMissions().filter((m) => m.status === 'active' || m.status === 'simulating');
  },

  createDraft(data: MissionFormData): Mission {
    const now = new Date().toISOString();
    const mission: Mission = {
      id: generateId(),
      ...data,
      status: 'draft',
      referencePoints: [],
      createdAt: now,
      updatedAt: now,
    };
    const missions = loadMissions();
    missions.unshift(mission);
    saveMissions(missions);
    return mission;
  },

  update(id: string, data: Partial<Mission>): Mission | undefined {
    const missions = loadMissions();
    const index = missions.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    missions[index] = {
      ...missions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveMissions(missions);
    return missions[index];
  },

  activate(id: string): Mission | undefined {
    return this.update(id, { status: 'active' });
  },

  delete(id: string): boolean {
    const missions = loadMissions();
    const filtered = missions.filter((m) => m.id !== id);
    if (filtered.length === missions.length) return false;
    saveMissions(filtered);
    return true;
  },
};
