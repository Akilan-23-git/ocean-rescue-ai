import type { AdminSettings, AdminUser, AdminTeam, AuditLogEntry } from '@/types/admin';
import { generateId } from '@/utils';

const STORAGE_KEY = 'msar_admin_settings';

const DEFAULT_SETTINGS: AdminSettings = {
  users: [
    {
      id: 'u1',
      name: 'Coast Guard Operator',
      email: 'operator@msar.gov',
      role: 'admin',
      teamId: 't1',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u2',
      name: 'SAR Analyst',
      email: 'analyst@msar.gov',
      role: 'operator',
      teamId: 't1',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u3',
      name: 'Watch Officer',
      email: 'watch@msar.gov',
      role: 'viewer',
      teamId: 't2',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
  teams: [
    { id: 't1', name: 'Coast Guard Unit Alpha', unit: 'ICG West', members: 8, lead: 'CG Operator' },
    { id: 't2', name: 'Rescue Flotilla Bravo', unit: 'ICG South', members: 12, lead: 'Watch Officer' },
    { id: 't3', name: 'Aerial SAR Team', unit: 'CG Aviation', members: 6, lead: 'Pilot Lead' },
  ],
  api: {
    springBootUrl: 'http://localhost:8080/api',
    fastapiUrl: 'http://localhost:8000/api',
    timeoutMs: 30000,
    authEnabled: true,
  },
  models: {
    defaultDriftModel: 'opendrift',
    defaultWeatherSource: 'gfs',
    defaultOceanModel: 'hycom',
    defaultAiModel: 'ensemble-v2',
    defaultAccuracy: 'balanced',
  },
  notifications: {
    emailAlerts: true,
    missionUpdates: true,
    weatherWarnings: true,
    simulationComplete: true,
    soundEnabled: false,
  },
  theme: {
    density: 'comfortable',
    accent: 'cyan',
    reduceMotion: false,
  },
  dataSources: {
    weatherApi: 'GFS / ECMWF gateway',
    oceanApi: 'HYCOM / CMEMS',
    mapsProvider: 'OpenStreetMap',
    autoRefreshMinutes: 5,
  },
  auditLogs: [
    {
      id: 'a1',
      action: 'SYSTEM_INIT',
      actor: 'system',
      details: 'Admin settings initialized',
      timestamp: new Date().toISOString(),
    },
  ],
};

function load(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    return { ...structuredClone(DEFAULT_SETTINGS), ...(JSON.parse(raw) as AdminSettings) };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

function save(settings: AdminSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function log(settings: AdminSettings, action: string, details: string, actor = 'Admin'): AdminSettings {
  const entry: AuditLogEntry = {
    id: generateId(),
    action,
    actor,
    details,
    timestamp: new Date().toISOString(),
  };
  return {
    ...settings,
    auditLogs: [entry, ...settings.auditLogs].slice(0, 200),
  };
}

export const adminService = {
  get(): AdminSettings {
    return load();
  },

  saveAll(settings: AdminSettings): AdminSettings {
    const next = log(settings, 'SETTINGS_SAVE', 'Configuration updated');
    save(next);
    return next;
  },

  updatePartial(partial: Partial<AdminSettings>, action: string, details: string): AdminSettings {
    const current = load();
    const next = log({ ...current, ...partial }, action, details);
    save(next);
    return next;
  },

  addUser(user: Omit<AdminUser, 'id' | 'createdAt'>): AdminSettings {
    const current = load();
    const newUser: AdminUser = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    return this.updatePartial(
      { users: [...current.users, newUser] },
      'USER_CREATE',
      `Created user ${newUser.email}`,
    );
  },

  removeUser(id: string): AdminSettings {
    const current = load();
    const user = current.users.find((u) => u.id === id);
    return this.updatePartial(
      { users: current.users.filter((u) => u.id !== id) },
      'USER_DELETE',
      `Removed user ${user?.email ?? id}`,
    );
  },

  addTeam(team: Omit<AdminTeam, 'id'>): AdminSettings {
    const current = load();
    const newTeam: AdminTeam = { ...team, id: generateId() };
    return this.updatePartial(
      { teams: [...current.teams, newTeam] },
      'TEAM_CREATE',
      `Created team ${newTeam.name}`,
    );
  },

  removeTeam(id: string): AdminSettings {
    const current = load();
    const team = current.teams.find((t) => t.id === id);
    return this.updatePartial(
      { teams: current.teams.filter((t) => t.id !== id) },
      'TEAM_DELETE',
      `Removed team ${team?.name ?? id}`,
    );
  },

  exportBackup(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        admin: load(),
        missions: localStorage.getItem('msar_missions'),
      },
      null,
      2,
    );
  },

  restoreBackup(json: string): { ok: boolean; message: string } {
    try {
      const data = JSON.parse(json) as { admin?: AdminSettings; missions?: string | null };
      if (data.admin) {
        save(log(data.admin, 'BACKUP_RESTORE', 'Settings restored from backup'));
      }
      if (typeof data.missions === 'string') {
        localStorage.setItem('msar_missions', data.missions);
      } else if (data.missions === null) {
        localStorage.removeItem('msar_missions');
      }
      return { ok: true, message: 'Backup restored successfully' };
    } catch {
      return { ok: false, message: 'Invalid backup file' };
    }
  },

  getDefaults(): AdminSettings {
    return structuredClone(DEFAULT_SETTINGS);
  },
};
