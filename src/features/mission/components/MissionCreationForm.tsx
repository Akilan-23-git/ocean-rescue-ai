import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  Snackbar,
  Divider,
  alpha,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SailingIcon from '@mui/icons-material/Sailing';
import PoolIcon from '@mui/icons-material/Pool';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { laptopTwoColumn } from '@/constants/layout';
import {
  INCIDENT_TYPES,
  OBJECT_TYPES,
  LIFE_JACKET_STATUS,
} from '@/constants';
import { generateMissionId, toLocalDateTimeInput } from '@/utils';
import type { MissionFormData, ObjectType } from '@/types';
import { useCreateMissionDraft, useUpdateMission, useActivateMission } from '../hooks/useMissions';
import { useMissionContext } from '@/context/MissionContext';

const objectIcons: Record<ObjectType, React.ReactNode> = {
  missing_person: <PersonIcon />,
  fishing_boat: <DirectionsBoatIcon />,
  cargo_ship: <LocalShippingIcon />,
  sail_boat: <SailingIcon />,
  life_raft: <PoolIcon />,
  oil_spill: <WaterDropIcon />,
  shipping_container: <Inventory2Icon />,
};

const defaultValues: MissionFormData = {
  missionId: generateMissionId(),
  name: '',
  rescueTeamName: '',
  incidentType: 'search_rescue',
  lastKnownPosition: null,
  incidentDateTime: new Date().toISOString(),
  objectType: 'missing_person',
  numberOfPeople: 1,
  lifeJacketStatus: 'unknown',
  additionalNotes: '',
};

interface MissionCreationFormProps {
  missionId?: string;
  initialData?: MissionFormData;
  isEdit?: boolean;
}

export function MissionCreationForm({ missionId, initialData, isEdit }: MissionCreationFormProps) {
  const navigate = useNavigate();
  const { setCurrentMission } = useMissionContext();
  const createDraft = useCreateMissionDraft();
  const updateMission = useUpdateMission();
  const activateMission = useActivateMission();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<MissionFormData>({
    defaultValues: initialData ?? defaultValues,
  });

  const objectType = watch('objectType');
  const showLifeJacket = objectType === 'missing_person';

  const onSaveDraft = handleSubmit(async (data) => {
    try {
      if (isEdit && missionId) {
        const updated = await updateMission.mutateAsync({ id: missionId, data });
        if (updated) {
          setCurrentMission(updated);
          setSnackbar({ open: true, message: 'Draft saved successfully', severity: 'success' });
        }
      } else {
        const mission = await createDraft.mutateAsync(data);
        setCurrentMission(mission);
        setSnackbar({ open: true, message: 'Draft created successfully', severity: 'success' });
        navigate(`/missions/${mission.id}/location`);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to save draft', severity: 'error' });
    }
  });

  const onStartSimulation = handleSubmit(async (data) => {
    try {
      let id = missionId;
      if (!isEdit || !missionId) {
        const mission = await createDraft.mutateAsync(data);
        id = mission.id;
        setCurrentMission(mission);
      } else {
        await updateMission.mutateAsync({ id: missionId, data });
      }
      if (id) {
        const activated = await activateMission.mutateAsync(id);
        if (activated) {
          setCurrentMission(activated);
          navigate(`/missions/${id}/location`);
        }
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to start simulation', severity: 'error' });
    }
  });

  return (
    <LaptopContainer>
      <PageHeader
        title="Create New Mission"
        subtitle="Initialize a maritime search and rescue operation with incident details"
        badge={<PhaseIndicator currentPhase={1} totalPhases={13} label="Mission Creation" />}
      />

      <form>
        <Box sx={laptopTwoColumn}>
          <GlassCard sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Mission Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Provide essential information about the rescue operation
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="missionId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mission ID"
                        fullWidth
                        disabled
                        InputProps={{
                          sx: { fontFamily: 'monospace', fontWeight: 600 },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Mission name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mission Name"
                        fullWidth
                        placeholder="e.g. Arabian Sea Rescue Op-47"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="rescueTeamName"
                    control={control}
                    rules={{ required: 'Rescue team name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Rescue Team Name"
                        fullWidth
                        placeholder="e.g. Coast Guard Unit Alpha"
                        error={!!errors.rescueTeamName}
                        helperText={errors.rescueTeamName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="incidentType"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Incident Type" fullWidth>
                        {INCIDENT_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="incidentDateTime"
                    control={control}
                    rules={{ required: 'Incident date & time is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={toLocalDateTimeInput(field.value)}
                        onChange={(e) => {
                          field.onChange(new Date(e.target.value).toISOString());
                        }}
                        label="Date & Time of Incident"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.incidentDateTime}
                        helperText={errors.incidentDateTime?.message ?? 'Local time — stored as UTC'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="numberOfPeople"
                    control={control}
                    rules={{ min: { value: 0, message: 'Must be 0 or more' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        label="Number of People"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom fontWeight={600}>
                Object Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the type of object or person being searched for
              </Typography>

              <Controller
                name="objectType"
                control={control}
                render={({ field }) => (
                  <Grid container spacing={1.5}>
                    {OBJECT_TYPES.map((obj) => (
                      <Grid item xs={6} sm={4} md={3} key={obj.value}>
                        <Box
                          component={motion.div}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => field.onChange(obj.value)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: '2px solid',
                            borderColor:
                              field.value === obj.value ? 'secondary.main' : 'divider',
                            bgcolor: (theme) =>
                              field.value === obj.value
                                ? alpha(theme.palette.secondary.main, 0.1)
                                : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'secondary.main',
                              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.05),
                            },
                          }}
                        >
                          <Box sx={{ color: 'secondary.main', mb: 0.5 }}>
                            {objectIcons[obj.value as ObjectType]}
                          </Box>
                          <Typography variant="caption" fontWeight={600}>
                            {obj.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />

              {showLifeJacket && (
                <Box sx={{ mt: 3 }}>
                  <Controller
                    name="lifeJacketStatus"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Life Jacket Status" fullWidth>
                        {LIFE_JACKET_STATUS.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Controller
                  name="additionalNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Additional Notes"
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Weather conditions at time of incident, vessel description, last communication details..."
                    />
                  )}
                />
              </Box>
            </GlassCard>

          <GlassCard sx={{ p: 3, position: 'sticky', top: 16 }} delay={0.1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Mission Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review before proceeding to incident location
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {[
                  { label: 'Mission ID', value: watch('missionId') },
                  { label: 'Object', value: OBJECT_TYPES.find((o) => o.value === objectType)?.label },
                  { label: 'Incident', value: INCIDENT_TYPES.find((i) => i.value === watch('incidentType'))?.label },
                  { label: 'People', value: watch('numberOfPeople') },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Next step: Set the last known position on the interactive ocean map (Phase 2).
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SaveOutlinedIcon />}
                  onClick={onSaveDraft}
                  disabled={createDraft.isPending || updateMission.isPending}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={onStartSimulation}
                  disabled={createDraft.isPending || activateMission.isPending}
                >
                  Start Simulation
                </Button>
              </Box>

              {isDirty && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1.5, display: 'block' }}>
                  Unsaved changes
                </Typography>
              )}
            </GlassCard>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LaptopContainer>
  );
}