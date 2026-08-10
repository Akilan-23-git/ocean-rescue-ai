import type { Mission, MissionFormData, MissionStatus } from '@/types';
import type {
  MissionTimelineEvent,
  MissionNote,
  MissionAttachment,
  MissionOutcome,
  ActualPathPoint,
} from '@/types/management';
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

function createTimelineEvent(
  type: MissionTimelineEvent['type'],
  title: string,
  description?: string,
): MissionTimelineEvent {
  return {
    id: generateId(),
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    actor: 'Coast Guard Operator',
  };
}

function offsetPath(
  predicted: { lat: number; lng: number; hour: number; timestamp: string }[],
): ActualPathPoint[] {
  return predicted.map((p, i) => ({
    lat: p.lat + (Math.sin(i * 0.7) * 0.02 + 0.005),
    lng: p.lng + (Math.cos(i * 0.5) * 0.025 - 0.008),
    hour: p.hour,
    timestamp: p.timestamp,
  }));
}

export const missionService = {
  getAll(): Mission[] {
    return loadMissions();
  },

  getById(id: string): Mission | undefined {
    return loadMissions().find((m) => m.id === id);
  },

  getByStatus(status: MissionStatus | 'all'): Mission[] {
    const missions = loadMissions();
    if (status === 'all') return missions;
    return missions.filter((m) => m.status === status);
  },

  createDraft(data: MissionFormData): Mission {
    const now = new Date().toISOString();
    const mission: Mission = {
      id: generateId(),
      ...data,
      status: 'draft',
      triggerType: 'MANUAL',
      source: 'OPERATOR',
      referencePoints: [],
      timeline: [createTimelineEvent('created', 'Mission created', data.name)],
      notes: [],
      attachments: [],
      searchHistory: [],
      outcome: 'ongoing',
      createdAt: now,
      updatedAt: now,
    };
    const missions = loadMissions();
    missions.unshift(mission);
    saveMissions(missions);
    return mission;
  },

  /** Upsert backend (SMS) missions into local storage without wiping manual missions. */
  syncRemoteMissions(remote: Mission[]): { added: Mission[]; updated: number } {
    const local = loadMissions();
    const bySid = new Map(
      local.filter((m) => m.messageSid).map((m) => [m.messageSid as string, m]),
    );
    const byMissionId = new Map(local.map((m) => [m.missionId, m]));
    const added: Mission[] = [];
    let updated = 0;

    for (const remoteMission of remote) {
      const existing =
        (remoteMission.messageSid && bySid.get(remoteMission.messageSid)) ||
        byMissionId.get(remoteMission.missionId);

      if (!existing) {
        local.unshift(remoteMission);
        added.push(remoteMission);
        continue;
      }

      // Preserve local simulation/progress fields; refresh SMS core fields
      const idx = local.findIndex((m) => m.id === existing.id);
      if (idx >= 0) {
        local[idx] = {
          ...local[idx],
          name: remoteMission.name,
          status: remoteMission.status,
          lastKnownPosition: remoteMission.lastKnownPosition ?? local[idx].lastKnownPosition,
          numberOfPeople: remoteMission.numberOfPeople,
          additionalNotes: remoteMission.additionalNotes,
          incidentDateTime: remoteMission.incidentDateTime,
          triggerType: remoteMission.triggerType ?? 'SMS',
          source: remoteMission.source,
          rawMessage: remoteMission.rawMessage,
          messageSid: remoteMission.messageSid,
          locationRequired: remoteMission.locationRequired,
          validationErrors: remoteMission.validationErrors,
          receivedAt: remoteMission.receivedAt,
          updatedAt: remoteMission.updatedAt,
          gpsAccuracy: remoteMission.gpsAccuracy,
          deviceId: remoteMission.deviceId,
        };
        updated += 1;
      }
    }

    saveMissions(local);
    return { added, updated };
  },

  getActiveEmergencies(): Mission[] {
    return loadMissions().filter(
      (m) => m.status === 'new_emergency' || m.status === 'needs_review',
    );
  },

  getActive(): Mission[] {
    return loadMissions().filter(
      (m) =>
        m.status === 'active' ||
        m.status === 'simulating' ||
        m.status === 'new_emergency' ||
        m.status === 'needs_review',
    );
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
    const mission = this.getById(id);
    if (!mission) return undefined;
    const timeline = [
      ...(mission.timeline ?? []),
      createTimelineEvent('status_change', 'Mission activated'),
    ];
    return this.update(id, { status: 'active', timeline });
  },

  setStatus(id: string, status: MissionStatus, outcome?: MissionOutcome): Mission | undefined {
    const mission = this.getById(id);
    if (!mission) return undefined;
    const timeline = [
      ...(mission.timeline ?? []),
      createTimelineEvent('status_change', `Status changed to ${status}`),
    ];
    const patch: Partial<Mission> = { status, timeline, outcome: outcome ?? mission.outcome };
    if (status === 'archived') patch.archivedAt = new Date().toISOString();
    if (status === 'completed' && mission.simulationResult && !mission.actualPath) {
      patch.actualPath = offsetPath(mission.simulationResult.primaryPath.points);
      patch.outcome = outcome ?? 'rescued';
    }
    return this.update(id, patch);
  },

  addNote(id: string, content: string, author = 'Coast Guard Operator'): Mission | undefined {
    const mission = this.getById(id);
    if (!mission) return undefined;
    const note: MissionNote = {
      id: generateId(),
      content,
      author,
      createdAt: new Date().toISOString(),
    };
    const timeline = [
      ...(mission.timeline ?? []),
      createTimelineEvent('note', 'Note added', content.slice(0, 80)),
    ];
    return this.update(id, {
      notes: [...(mission.notes ?? []), note],
      timeline,
    });
  },

  addAttachment(
    id: string,
    file: { name: string; type: string; size: number; dataUrl?: string },
  ): Mission | undefined {
    const mission = this.getById(id);
    if (!mission) return undefined;
    const attachment: MissionAttachment = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: file.dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Coast Guard Operator',
    };
    const timeline = [
      ...(mission.timeline ?? []),
      createTimelineEvent('attachment', 'Document attached', file.name),
    ];
    return this.update(id, {
      attachments: [...(mission.attachments ?? []), attachment],
      timeline,
    });
  },

  removeAttachment(id: string, attachmentId: string): Mission | undefined {
    const mission = this.getById(id);
    if (!mission) return undefined;
    return this.update(id, {
      attachments: (mission.attachments ?? []).filter((a) => a.id !== attachmentId),
    });
  },

  addSearchHistory(id: string, query: string): Mission | undefined {
    const mission = this.getById(id);
    if (!mission) return undefined;
    const history = [query, ...(mission.searchHistory ?? []).filter((q) => q !== query)].slice(0, 20);
    return this.update(id, { searchHistory: history });
  },

  ensureReplayData(id: string): Mission | undefined {
    const mission = this.getById(id);
    if (!mission?.simulationResult) return mission;
    if (mission.actualPath?.length) return mission;
    return this.update(id, {
      actualPath: offsetPath(mission.simulationResult.primaryPath.points),
      outcome: mission.outcome ?? 'rescued',
      status: mission.status === 'active' ? 'completed' : mission.status,
    });
  },

  delete(id: string): boolean {
    const missions = loadMissions();
    const filtered = missions.filter((m) => m.id !== id);
    if (filtered.length === missions.length) return false;
    saveMissions(filtered);
    return true;
  },
};
