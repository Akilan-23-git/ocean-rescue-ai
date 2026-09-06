export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  teamId: string | null;
  active: boolean;
  createdAt: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  unit: string;
  members: number;
  lead: string;
}

export interface ApiConfig {
  springBootUrl: string;
  fastapiUrl: string;
  timeoutMs: number;
  authEnabled: boolean;
}

export interface ModelPreferences {
  defaultDriftModel: string;
  defaultWeatherSource: string;
  defaultOceanModel: string;
  defaultAiModel: string;
  defaultAccuracy: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  missionUpdates: boolean;
  weatherWarnings: boolean;
  simulationComplete: boolean;
  soundEnabled: boolean;
}

export interface ThemePreferences {
  density: 'comfortable' | 'compact';
  accent: 'cyan' | 'ocean' | 'emerald';
  reduceMotion: boolean;
}

export interface DataSourceConfig {
  weatherApi: string;
  oceanApi: string;
  mapsProvider: string;
  autoRefreshMinutes: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface AdminSettings {
  users: AdminUser[];
  teams: AdminTeam[];
  api: ApiConfig;
  models: ModelPreferences;
  notifications: NotificationSettings;
  theme: ThemePreferences;
  dataSources: DataSourceConfig;
  auditLogs: AuditLogEntry[];
}
