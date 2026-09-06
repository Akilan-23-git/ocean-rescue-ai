import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  alpha,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { adminService } from '@/features/administration/services/adminService';
import type { AdminSettings } from '@/types/admin';
import {
  DRIFT_MODELS,
  WEATHER_SOURCES,
  OCEAN_MODELS,
  AI_MODELS,
  ACCURACY_LEVELS,
} from '@/constants/layout';

export function AdministrationPanel() {
  const [settings, setSettings] = useState<AdminSettings>(() => adminService.get());
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'operator' | 'viewer';
    teamId: string;
  }>({
    name: '',
    email: '',
    role: 'operator',
    teamId: '',
  });
  const [newTeam, setNewTeam] = useState({ name: '', unit: '', lead: '', members: 1 });

  useEffect(() => {
    setSettings(adminService.get());
  }, []);

  const persist = (next: AdminSettings, message: string) => {
    setSettings(next);
    setSnack({ open: true, message });
  };

  const saveSection = (partial: Partial<AdminSettings>, action: string, details: string) => {
    persist(adminService.updatePartial(partial, action, details), 'Settings saved');
  };

  const handleBackup = () => {
    const json = adminService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    persist(adminService.updatePartial({}, 'BACKUP_EXPORT', 'Configuration backup downloaded'), 'Backup exported');
  };

  const handleRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = adminService.restoreBackup(String(reader.result));
      setSettings(adminService.get());
      setSnack({ open: true, message: result.message });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <LaptopContainer>
      <PageHeader
        title="Administration"
        subtitle="Configure users, teams, APIs, models, notifications, and system data"
        badge={<PhaseIndicator currentPhase={13} totalPhases={13} label="Administration" />}
      />

      <GlassCard sx={{ mb: 2.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, minHeight: 48 }}
        >
          <Tab label="Users" />
          <Tab label="Teams" />
          <Tab label="API" />
          <Tab label="Models" />
          <Tab label="Notifications" />
          <Tab label="Theme" />
          <Tab label="Data Sources" />
          <Tab label="Backup" />
          <Tab label="Audit Logs" />
        </Tabs>
      </GlassCard>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 2.5 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              User Management
            </Typography>
            {settings.users.map((u) => (
              <Box
                key={u.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {u.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email} · {u.role}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" label={u.active ? 'Active' : 'Inactive'} color={u.active ? 'success' : 'default'} />
                  <IconButton size="small" onClick={() => persist(adminService.removeUser(u.id), 'User removed')}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </GlassCard>
          <GlassCard sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Add User
            </Typography>
            <TextField size="small" fullWidth label="Name" sx={{ mb: 1.5 }} value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            <TextField size="small" fullWidth label="Email" sx={{ mb: 1.5 }} value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <TextField
              select
              size="small"
              fullWidth
              label="Role"
              sx={{ mb: 1.5 }}
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value as 'admin' | 'operator' | 'viewer' })
              }
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="operator">Operator</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              fullWidth
              label="Team"
              sx={{ mb: 2 }}
              value={newUser.teamId}
              onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {settings.teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              disabled={!newUser.name || !newUser.email}
              onClick={() => {
                persist(
                  adminService.addUser({
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    teamId: newUser.teamId || null,
                    active: true,
                  }),
                  'User created',
                );
                setNewUser({ name: '', email: '', role: 'operator', teamId: '' });
              }}
            >
              Add User
            </Button>
          </GlassCard>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 2.5 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Team Management
            </Typography>
            {settings.teams.map((t) => (
              <Box
                key={t.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.unit} · Lead: {t.lead} · {t.members} members
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => persist(adminService.removeTeam(t.id), 'Team removed')}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </GlassCard>
          <GlassCard sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Add Team
            </Typography>
            <TextField size="small" fullWidth label="Team Name" sx={{ mb: 1.5 }} value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} />
            <TextField size="small" fullWidth label="Unit" sx={{ mb: 1.5 }} value={newTeam.unit} onChange={(e) => setNewTeam({ ...newTeam, unit: e.target.value })} />
            <TextField size="small" fullWidth label="Lead" sx={{ mb: 1.5 }} value={newTeam.lead} onChange={(e) => setNewTeam({ ...newTeam, lead: e.target.value })} />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Members"
              sx={{ mb: 2 }}
              value={newTeam.members}
              onChange={(e) => setNewTeam({ ...newTeam, members: Number(e.target.value) || 1 })}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<GroupAddIcon />}
              disabled={!newTeam.name}
              onClick={() => {
                persist(adminService.addTeam(newTeam), 'Team created');
                setNewTeam({ name: '', unit: '', lead: '', members: 1 });
              }}
            >
              Add Team
            </Button>
          </GlassCard>
        </Box>
      )}

      {tab === 2 && (
        <GlassCard sx={{ p: 3, maxWidth: 720 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            API Configuration
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Spring Boot API URL"
            sx={{ mb: 2 }}
            value={settings.api.springBootUrl}
            onChange={(e) => setSettings({ ...settings, api: { ...settings.api, springBootUrl: e.target.value } })}
          />
          <TextField
            fullWidth
            size="small"
            label="FastAPI URL"
            sx={{ mb: 2 }}
            value={settings.api.fastapiUrl}
            onChange={(e) => setSettings({ ...settings, api: { ...settings.api, fastapiUrl: e.target.value } })}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Timeout (ms)"
            sx={{ mb: 2 }}
            value={settings.api.timeoutMs}
            onChange={(e) =>
              setSettings({ ...settings, api: { ...settings.api, timeoutMs: Number(e.target.value) || 30000 } })
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.api.authEnabled}
                onChange={(e) => setSettings({ ...settings, api: { ...settings.api, authEnabled: e.target.checked } })}
              />
            }
            label="Enable Bearer authentication"
            sx={{ mb: 2, display: 'block' }}
          />
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => saveSection({ api: settings.api }, 'API_UPDATE', 'API endpoints updated')}>
            Save API Config
          </Button>
        </GlassCard>
      )}

      {tab === 3 && (
        <GlassCard sx={{ p: 3, maxWidth: 720 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Model Selection Defaults
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              select
              size="small"
              label="Drift Model"
              value={settings.models.defaultDriftModel}
              onChange={(e) => setSettings({ ...settings, models: { ...settings.models, defaultDriftModel: e.target.value } })}
            >
              {DRIFT_MODELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Weather Source"
              value={settings.models.defaultWeatherSource}
              onChange={(e) => setSettings({ ...settings, models: { ...settings.models, defaultWeatherSource: e.target.value } })}
            >
              {WEATHER_SOURCES.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Ocean Model"
              value={settings.models.defaultOceanModel}
              onChange={(e) => setSettings({ ...settings, models: { ...settings.models, defaultOceanModel: e.target.value } })}
            >
              {OCEAN_MODELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="AI Model"
              value={settings.models.defaultAiModel}
              onChange={(e) => setSettings({ ...settings, models: { ...settings.models, defaultAiModel: e.target.value } })}
            >
              {AI_MODELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Accuracy"
              value={settings.models.defaultAccuracy}
              onChange={(e) => setSettings({ ...settings, models: { ...settings.models, defaultAccuracy: e.target.value } })}
            >
              {ACCURACY_LEVELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => saveSection({ models: settings.models }, 'MODEL_UPDATE', 'Default models updated')}>
            Save Model Defaults
          </Button>
        </GlassCard>
      )}

      {tab === 4 && (
        <GlassCard sx={{ p: 3, maxWidth: 560 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Notification Settings
          </Typography>
          {(
            [
              ['emailAlerts', 'Email alerts'],
              ['missionUpdates', 'Mission status updates'],
              ['weatherWarnings', 'Weather warnings'],
              ['simulationComplete', 'Simulation complete'],
              ['soundEnabled', 'Sound notifications'],
            ] as const
          ).map(([key, label]) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={settings.notifications[key]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, [key]: e.target.checked },
                    })
                  }
                />
              }
              label={label}
              sx={{ display: 'flex', ml: 0, mb: 0.5 }}
            />
          ))}
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => saveSection({ notifications: settings.notifications }, 'NOTIF_UPDATE', 'Notification preferences updated')}
          >
            Save Notifications
          </Button>
        </GlassCard>
      )}

      {tab === 5 && (
        <GlassCard sx={{ p: 3, maxWidth: 560 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Theme Preferences
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Density"
            sx={{ mb: 2 }}
            value={settings.theme.density}
            onChange={(e) =>
              setSettings({
                ...settings,
                theme: { ...settings.theme, density: e.target.value as 'comfortable' | 'compact' },
              })
            }
          >
            <MenuItem value="comfortable">Comfortable</MenuItem>
            <MenuItem value="compact">Compact</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label="Accent"
            sx={{ mb: 2 }}
            value={settings.theme.accent}
            onChange={(e) =>
              setSettings({
                ...settings,
                theme: { ...settings.theme, accent: e.target.value as 'cyan' | 'ocean' | 'emerald' },
              })
            }
          >
            <MenuItem value="cyan">Cyan</MenuItem>
            <MenuItem value="ocean">Ocean Blue</MenuItem>
            <MenuItem value="emerald">Emerald</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={settings.theme.reduceMotion}
                onChange={(e) =>
                  setSettings({ ...settings, theme: { ...settings.theme, reduceMotion: e.target.checked } })
                }
              />
            }
            label="Reduce motion"
            sx={{ display: 'block', mb: 2 }}
          />
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => saveSection({ theme: settings.theme }, 'THEME_UPDATE', 'Theme preferences updated')}>
            Save Theme
          </Button>
        </GlassCard>
      )}

      {tab === 6 && (
        <GlassCard sx={{ p: 3, maxWidth: 720 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Data Source Configuration
          </Typography>
          <TextField fullWidth size="small" label="Weather API" sx={{ mb: 2 }} value={settings.dataSources.weatherApi} onChange={(e) => setSettings({ ...settings, dataSources: { ...settings.dataSources, weatherApi: e.target.value } })} />
          <TextField fullWidth size="small" label="Ocean API" sx={{ mb: 2 }} value={settings.dataSources.oceanApi} onChange={(e) => setSettings({ ...settings, dataSources: { ...settings.dataSources, oceanApi: e.target.value } })} />
          <TextField fullWidth size="small" label="Maps Provider" sx={{ mb: 2 }} value={settings.dataSources.mapsProvider} onChange={(e) => setSettings({ ...settings, dataSources: { ...settings.dataSources, mapsProvider: e.target.value } })} />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Auto-refresh (minutes)"
            sx={{ mb: 2 }}
            value={settings.dataSources.autoRefreshMinutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                dataSources: { ...settings.dataSources, autoRefreshMinutes: Number(e.target.value) || 5 },
              })
            }
          />
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => saveSection({ dataSources: settings.dataSources }, 'DATASOURCE_UPDATE', 'Data sources updated')}>
            Save Data Sources
          </Button>
        </GlassCard>
      )}

      {tab === 7 && (
        <GlassCard sx={{ p: 3, maxWidth: 640 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Backup & Restore
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Backup includes admin settings and all locally stored missions.
          </Alert>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleBackup}>
              Export Backup
            </Button>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              Restore Backup
              <input hidden type="file" accept=".json,application/json" onChange={handleRestore} />
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={() => {
                const defaults = adminService.getDefaults();
                persist(adminService.saveAll(defaults), 'Settings reset to defaults');
              }}
            >
              Reset Defaults
            </Button>
          </Box>
        </GlassCard>
      )}

      {tab === 8 && (
        <GlassCard sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Audit Logs
          </Typography>
          <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
            {settings.auditLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  py: 1.25,
                  px: 1.5,
                  mb: 0.75,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="secondary.main">
                    {log.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2">{log.details}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Actor: {log.actor}
                </Typography>
              </Box>
            ))}
          </Box>
        </GlassCard>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, message: '' })}
        message={snack.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </LaptopContainer>
  );
}
