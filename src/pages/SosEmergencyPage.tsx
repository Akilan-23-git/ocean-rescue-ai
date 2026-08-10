import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress, alpha } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { submitSosEmergency } from '@/services/emergencyApi';
import { formatCoordinates, generateId } from '@/utils';

type SosPhase = 'idle' | 'locating' | 'ready' | 'holding' | 'sending' | 'sent' | 'error';

const HOLD_MS = 2000;
const LOW_ACCURACY_M = 50;

function getOrCreateDeviceId(): string {
  const key = 'msar_sos_device_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `sos-${generateId()}`;
  localStorage.setItem(key, id);
  return id;
}

function formatAccuracy(meters: number): string {
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`;
  return `${meters.toFixed(0)} meters`;
}

export function SosEmergencyPage() {
  const [phase, setPhase] = useState<SosPhase>('idle');
  const [holdPct, setHoldPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);
  const deviceId = useRef(getOrCreateDeviceId());

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldPct(0);
  }, []);

  const requestLocation = useCallback(() => {
    setError(null);
    if (!navigator.geolocation) {
      setPhase('error');
      setError('This browser does not support geolocation.');
      return;
    }
    setPhase('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setPhase('ready');
      },
      (err) => {
        setPhase('error');
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission is required to send an SOS.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Move outdoors and try again.');
        } else {
          setError('Unable to obtain your location. Please move to an area with better GPS signal.');
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
    return () => clearHold();
  }, [requestLocation, clearHold]);

  const activateSos = useCallback(async () => {
    if (lat === null || lng === null || accuracy === null) {
      setError('Location permission is required to send an SOS.');
      setPhase('error');
      return;
    }
    setPhase('sending');
    setError(null);
    try {
      const clientEventId = `sos-evt-${Date.now()}-${generateId().slice(0, 8)}`;
      const result = await submitSosEmergency({
        deviceId: deviceId.current,
        latitude: lat,
        longitude: lng,
        accuracy,
        timestamp: new Date().toISOString(),
        emergencyType: 'man_overboard',
        numberOfPeople: 1,
        clientEventId,
      });
      if (!result.success || !result.missionId) {
        throw new Error(result.message || 'SOS failed');
      }
      setMissionId(result.missionId);
      setPhase('sent');
    } catch {
      setPhase('error');
      setError('Unable to reach MSAR emergency API. Check connection and try again.');
    }
  }, [lat, lng, accuracy]);

  const startHold = () => {
    if (phase !== 'ready') return;
    clearHold();
    setPhase('holding');
    holdStart.current = Date.now();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_MS) * 100));
      setHoldPct(pct);
      if (pct >= 100) {
        clearHold();
        void activateSos();
      }
    }, 50);
  };

  const endHold = () => {
    if (phase === 'holding') {
      clearHold();
      setPhase('ready');
    }
  };

  const lowAccuracy = accuracy !== null && accuracy > LOW_ACCURACY_M;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: '#0a0e1a',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2.5,
        py: 3,
        fontFamily: 'Inter, sans-serif',
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.18) 0%, transparent 55%)',
      }}
    >
      <Typography variant="overline" letterSpacing={3} color="error.light" fontWeight={700}>
        MSAR EMERGENCY
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 2 }}>
        Distress SOS
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha('#111827', 0.85),
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          EMERGENCY STATUS
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
          {phase === 'sent'
            ? 'SOS ACTIVATED'
            : phase === 'sending'
              ? 'SENDING…'
              : phase === 'holding'
                ? `HOLD ${holdPct}%`
                : phase === 'locating'
                  ? 'OBTAINING GPS…'
                  : phase === 'error'
                    ? 'BLOCKED'
                    : 'READY'}
        </Typography>
        {missionId && (
          <Typography variant="body2" color="secondary.main" fontWeight={600} sx={{ mt: 0.5 }}>
            Mission {missionId}
          </Typography>
        )}
      </Box>

      <Box
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        sx={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: phase === 'ready' || phase === 'holding' ? 'pointer' : 'not-allowed',
          userSelect: 'none',
          touchAction: 'none',
          background:
            phase === 'sent'
              ? 'linear-gradient(145deg, #10b981, #059669)'
              : `conic-gradient(#ef4444 ${holdPct}%, rgba(239,68,68,0.2) 0)`,
          boxShadow: `0 0 40px ${alpha('#ef4444', 0.45)}`,
          mb: 3,
          opacity: phase === 'ready' || phase === 'holding' || phase === 'sent' ? 1 : 0.55,
        }}
      >
        <Box
          sx={{
            width: 190,
            height: 190,
            borderRadius: '50%',
            bgcolor: '#0a0e1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {phase === 'sending' || phase === 'locating' ? (
            <CircularProgress color="error" />
          ) : phase === 'sent' ? (
            <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
          ) : (
            <>
              <Typography variant="h3" fontWeight={900} color="error.main">
                SOS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HOLD 2 SECONDS
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: lowAccuracy ? 'warning.main' : 'divider',
          bgcolor: alpha('#111827', 0.85),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MyLocationIcon fontSize="small" color="secondary" />
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            LOCATION STATUS
          </Typography>
        </Box>

        {lat !== null && lng !== null ? (
          <>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              {formatCoordinates(lat, lng)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              GPS Accuracy: {accuracy !== null ? formatAccuracy(accuracy) : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Coordinates are reported GPS estimates — not exact.
            </Typography>
            {lowAccuracy && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <WarningAmberIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="warning.main" fontWeight={700}>
                  LOW GPS ACCURACY
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Waiting for device GPS…
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error.main" sx={{ mt: 1.5 }} fontWeight={600}>
            {error}
          </Typography>
        )}

        {(phase === 'error' || phase === 'idle') && (
          <Button fullWidth variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={requestLocation}>
            Retry Location
          </Button>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center', maxWidth: 360 }}>
        Press and hold the SOS button for 2 seconds to alert MSAR. Requires HTTPS and location permission.
      </Typography>
    </Box>
  );
}
