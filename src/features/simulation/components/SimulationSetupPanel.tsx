import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  LinearProgress,
  alpha,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { useMission } from '@/features/mission/hooks/useMissions';
import { useSaveSimulationConfig, useRunSimulation } from '../hooks/useSimulation';
import { simulationService } from '../services/simulationService';
import type { SimulationConfig } from '@/types/simulation';
import {
  SIMULATION_DURATIONS,
  DRIFT_MODELS,
  WEATHER_SOURCES,
  OCEAN_MODELS,
  ACCURACY_LEVELS,
  AI_MODELS,
  PARTICLE_COUNT_PRESETS,
  laptopTwoColumn,
} from '@/constants/layout';

export function SimulationSetupPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission } = useMission(missionId);
  const saveConfig = useSaveSimulationConfig();
  const runSimulation = useRunSimulation();
  const [cancelled, setCancelled] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<SimulationConfig>({
    defaultValues: mission?.simulationConfig ?? simulationService.getDefaultConfig(),
  });

  const config = watch();
  const isRunning = runSimulation.isPending;

  const onSave = handleSubmit(async (data) => {
    if (!missionId) return;
    await saveConfig.mutateAsync({ missionId, config: data });
  });

  const onStart = handleSubmit(async (data) => {
    if (!missionId || !mission?.lastKnownPosition) return;
    setCancelled(false);
    const updated = await runSimulation.mutateAsync({
      missionId,
      origin: mission.lastKnownPosition,
      config: data,
    });
    if (updated) navigate(`/missions/${missionId}/prediction`);
  });

  if (!mission) {
    return <Alert severity="warning">Mission not found.</Alert>;
  }

  if (!mission.lastKnownPosition) {
    return (
      <Alert severity="warning" action={<Button onClick={() => navigate(`/missions/${missionId}/location`)}>Set Location</Button>}>
        Incident location required before simulation setup.
      </Alert>
    );
  }

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={4} />
      <PageHeader
        title="Simulation Setup"
        subtitle={`Configure drift prediction parameters for ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={4} totalPhases={13} label="Simulation Setup" />}
        action={<StatusChip status={mission.status} />}
      />

      <Box sx={laptopTwoColumn}>
        <GlassCard sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Prediction Configuration
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Simulation Duration
          </Typography>
          <Controller
            name="durationHours"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={field.value}
                onChange={(_, v) => v && field.onChange(v)}
                size="small"
                sx={{ mb: 2.5 }}
              >
                {SIMULATION_DURATIONS.map((d) => (
                  <ToggleButton key={d} value={d} sx={{ flex: 1 }}>
                    {d}h
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Monte Carlo Particles: {config.particleCount.toLocaleString()}
          </Typography>
          <Controller
            name="particleCount"
            control={control}
            render={({ field }) => (
              <Slider
                value={field.value}
                min={500}
                max={10000}
                step={500}
                onChange={(_, v) => field.onChange(v)}
                marks={PARTICLE_COUNT_PRESETS.map((p) => ({ value: p, label: p >= 5000 ? `${p / 1000}k` : String(p) }))}
                sx={{ mb: 2.5 }}
              />
            )}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Controller
              name="driftModel"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Drift Model" size="small" fullWidth>
                  {DRIFT_MODELS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="aiModel"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="AI Model" size="small" fullWidth>
                  {AI_MODELS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="weatherSource"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Weather Source" size="small" fullWidth>
                  {WEATHER_SOURCES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="oceanModel"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Ocean Model" size="small" fullWidth>
                  {OCEAN_MODELS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Accuracy Level
          </Typography>
          <Controller
            name="accuracyLevel"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {ACCURACY_LEVELS.map((level) => (
                  <Box
                    key={level.value}
                    onClick={() => {
                      field.onChange(level.value);
                      setValue('particleCount', level.particles);
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: field.value === level.value ? 'secondary.main' : 'divider',
                      bgcolor: (theme) =>
                        field.value === level.value
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : 'transparent',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {level.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <GlassCard sx={{ p: 2.5 }} delay={0.05}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Configuration Summary
            </Typography>
            {[
              ['Duration', `${config.durationHours} hours`],
              ['Particles', config.particleCount.toLocaleString()],
              ['Model', DRIFT_MODELS.find((m) => m.value === config.driftModel)?.label],
              ['Weather', WEATHER_SOURCES.find((m) => m.value === config.weatherSource)?.label],
              ['Ocean', OCEAN_MODELS.find((m) => m.value === config.oceanModel)?.label],
              ['AI', AI_MODELS.find((m) => m.value === config.aiModel)?.label],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={600}>{v}</Typography>
              </Box>
            ))}
          </GlassCard>

          {isRunning && !cancelled && (
            <GlassCard sx={{ p: 2.5 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Running Simulation…
              </Typography>
              <LinearProgress variant="determinate" value={runSimulation.progress} sx={{ mb: 1, height: 8, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {runSimulation.progress}% — Processing {config.particleCount} particles
              </Typography>
            </GlassCard>
          )}

          <GlassCard sx={{ p: 2.5, mt: 'auto' }} delay={0.1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSave} disabled={isRunning}>
                Save Configuration
              </Button>
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onStart} disabled={isRunning}>
                Start Simulation
              </Button>
              <Button
                variant="text"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelled(true)}
                disabled={!isRunning}
              >
                Cancel Simulation
              </Button>
            </Box>
          </GlassCard>
        </Box>
      </Box>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/environment`)}>
          Back to Environment
        </Button>
      </Box>
    </LaptopContainer>
  );
}
