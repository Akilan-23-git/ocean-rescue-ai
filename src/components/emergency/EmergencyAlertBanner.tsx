import { Box, Button, Typography, IconButton, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyAlerts } from '@/context/EmergencyContext';
import { formatCoordinates } from '@/utils';
import { INCIDENT_TYPES } from '@/constants';

export function EmergencyAlertBanner() {
  const { latestAlert, dismissAlert } = useEmergencyAlerts();
  const navigate = useNavigate();

  const mission = latestAlert;
  if (!mission) return null;

  const isSos = mission.triggerType === 'SOS_DEVICE';
  const incident =
    INCIDENT_TYPES.find((i) => i.value === mission.incidentType)?.label ??
    mission.incidentType.replace(/_/g, ' ').toUpperCase();

  const openMission = () => {
    dismissAlert();
    if (mission.locationRequired || !mission.lastKnownPosition) {
      navigate(`/missions/${mission.id}/location`);
    } else {
      navigate(`/missions/${mission.id}/location`);
    }
  };

  const sourceLabel =
    mission.triggerType === 'SOS_DEVICE'
      ? 'SOS DEVICE'
      : mission.triggerType === 'SMS'
        ? 'SMS'
        : mission.triggerType ?? 'UNKNOWN';

  return (
    <AnimatePresence>
      {mission && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          sx={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 1400,
            width: 380,
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.error.main, 0.5),
            boxShadow: `0 12px 40px ${alpha('#ef4444', 0.35)}`,
            backgroundImage: `linear-gradient(135deg, ${alpha('#ef4444', 0.12)} 0%, transparent 60%)`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <WarningAmberIcon color="error" />
              <Typography variant="subtitle1" fontWeight={800} color="error.main">
                {isSos ? 'SOS ACTIVATED' : 'NEW EMERGENCY'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={dismissAlert} aria-label="dismiss">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mission:
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {mission.missionId}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {incident}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Source: {sourceLabel}
          </Typography>

          {mission.lastKnownPosition ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Location:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {formatCoordinates(mission.lastKnownPosition.lat, mission.lastKnownPosition.lng)}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }} fontWeight={600}>
              LOCATION_REQUIRED — Emergency received, but location is missing.
            </Typography>
          )}

          {typeof mission.gpsAccuracy === 'number' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              GPS Accuracy: {mission.gpsAccuracy.toFixed(0)} meters
            </Typography>
          )}

          <Button variant="contained" color="error" fullWidth sx={{ mt: 2 }} onClick={openMission}>
            OPEN MISSION
          </Button>
        </Box>
      )}
    </AnimatePresence>
  );
}
