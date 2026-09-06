import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMissions } from '@/features/mission/hooks/useMissions';
import {
  buildMissionReportHtml,
  downloadReportHtml,
  printMissionReport,
} from '@/features/reports/services/reportService';
import { OBJECT_TYPES, INCIDENT_TYPES } from '@/constants';
import { formatCoordinates } from '@/utils';
import { MAP_PANEL_HEIGHT_COMPACT } from '@/constants/layout';

export function ReportsPanel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: missions = [] } = useMissions();
  const initialId = params.get('missionId') ?? missions.find((m) => m.simulationResult)?.id ?? missions[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState(initialId);

  const mission = useMemo(
    () => missions.find((m) => m.id === selectedId) ?? null,
    [missions, selectedId],
  );

  const exportPdf = () => {
    if (!mission) return;
    // Opens print dialog — user can choose "Save as PDF"
    printMissionReport(mission);
  };

  return (
    <LaptopContainer>
      <PageHeader
        title="Reports"
        subtitle="Generate formal maritime search and rescue documentation"
        badge={<PhaseIndicator currentPhase={12} totalPhases={13} label="Reports" />}
        action={
          mission ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => printMissionReport(mission)}>
                Print
              </Button>
              <Button
                variant="outlined"
                startIcon={<DescriptionIcon />}
                onClick={() => downloadReportHtml(mission)}
              >
                Download HTML
              </Button>
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportPdf}>
                Export as PDF
              </Button>
            </Box>
          ) : undefined
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 2.5 }}>
        <GlassCard sx={{ p: 2.5, height: 'fit-content' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Select Mission
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            sx={{ mb: 2 }}
          >
            {missions.length === 0 && <MenuItem value="">No missions</MenuItem>}
            {missions.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.missionId})
              </MenuItem>
            ))}
          </TextField>

          {missions.map((m) => (
            <Box
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              sx={{
                p: 1.25,
                mb: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedId === m.id ? 'secondary.main' : 'divider',
                bgcolor:
                  selectedId === m.id
                    ? (theme) => alpha(theme.palette.secondary.main, 0.08)
                    : 'transparent',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {m.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.missionId}
              </Typography>
            </Box>
          ))}

          {missions.length === 0 && (
            <Button fullWidth variant="contained" onClick={() => navigate('/missions/new')}>
              Create Mission
            </Button>
          )}
        </GlassCard>

        {mission ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} className="msar-report-preview">
            <GlassCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Formal Rescue Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mission.missionId} · Generated {new Date().toLocaleString()}
                  </Typography>
                </Box>
                <StatusChip status={mission.status} />
              </Box>

              <Section title="1. Mission Summary">
                <InfoGrid
                  items={[
                    ['Mission Name', mission.name],
                    ['Rescue Team', mission.rescueTeamName],
                    [
                      'Incident',
                      INCIDENT_TYPES.find((i) => i.value === mission.incidentType)?.label ?? mission.incidentType,
                    ],
                    [
                      'Object',
                      OBJECT_TYPES.find((o) => o.value === mission.objectType)?.label ?? mission.objectType,
                    ],
                    ['People', String(mission.numberOfPeople)],
                    ['Incident Time', new Date(mission.incidentDateTime).toLocaleString()],
                    [
                      'LKP',
                      mission.lastKnownPosition
                        ? formatCoordinates(mission.lastKnownPosition.lat, mission.lastKnownPosition.lng)
                        : '—',
                    ],
                    ['Outcome', mission.outcome ?? 'ongoing'],
                  ]}
                />
                {mission.additionalNotes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    {mission.additionalNotes}
                  </Typography>
                )}
              </Section>

              <Section title="2. Simulation Details">
                {mission.simulationConfig ? (
                  <InfoGrid
                    items={[
                      ['Duration', `${mission.simulationConfig.durationHours}h`],
                      ['Particles', mission.simulationConfig.particleCount.toLocaleString()],
                      ['Drift Model', mission.simulationConfig.driftModel],
                      ['Weather', mission.simulationConfig.weatherSource],
                      ['Ocean', mission.simulationConfig.oceanModel],
                      ['AI Model', mission.simulationConfig.aiModel],
                    ]}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No simulation configuration.
                  </Typography>
                )}
              </Section>

              <Section title="3. Weather Summary">
                {mission.rescueDecision?.weatherWarnings?.length ? (
                  mission.rescueDecision.weatherWarnings.map((w) => (
                    <Box key={w.id} sx={{ mb: 1 }}>
                      <Chip size="small" label={w.level} sx={{ mr: 1 }} />
                      <Typography variant="body2" component="span" fontWeight={600}>
                        {w.title}:{' '}
                      </Typography>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {w.message}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Environmental conditions were assessed at LKP (Phase 3). Attach decision-support run for
                    weather warning detail.
                  </Typography>
                )}
              </Section>

              <Section title="4. Drift Prediction Report">
                {mission.simulationResult ? (
                  <>
                    <InfoGrid
                      items={[
                        ['Drift Distance', `${mission.simulationResult.driftDistanceKm} km`],
                        ['Direction', `${mission.simulationResult.driftDirection}°`],
                        ['Confidence', `${mission.simulationResult.confidenceScore}%`],
                        ['Paths', String(mission.simulationResult.alternatePaths.length + 1)],
                      ]}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                      {mission.simulationResult.aiExplanation}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No prediction data.
                  </Typography>
                )}
              </Section>
            </GlassCard>

            {mission.lastKnownPosition && mission.simulationResult && (
              <GlassCard sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MapIcon color="secondary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    5. Search Area Map
                  </Typography>
                </Box>
                <Box sx={{ borderRadius: 2, overflow: 'hidden', height: MAP_PANEL_HEIGHT_COMPACT }}>
                  <PredictionMap
                    origin={mission.lastKnownPosition}
                    result={mission.simulationResult}
                    searchArea={mission.searchArea}
                    showHeatmap
                    showEllipse
                    showPaths
                    height={MAP_PANEL_HEIGHT_COMPACT}
                  />
                </Box>
              </GlassCard>
            )}

            <GlassCard sx={{ p: 3 }}>
              <Section title="6. Timeline">
                {(mission.timeline ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No timeline events.
                  </Typography>
                ) : (
                  (mission.timeline ?? []).map((t) => (
                    <Box key={t.id} sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {t.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(t.timestamp).toLocaleString()}
                        {t.description ? ` · ${t.description}` : ''}
                      </Typography>
                    </Box>
                  ))
                )}
              </Section>

              <Section title="7. Team Actions">
                {mission.rescueDecision && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2">
                      Station: <strong>{mission.rescueDecision.closestStation.name}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Vessel: <strong>{mission.rescueDecision.nearestVessel.name}</strong> (
                      {mission.rescueDecision.nearestVessel.callSign})
                    </Typography>
                  </Box>
                )}
                {(mission.notes ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No team notes recorded.
                  </Typography>
                ) : (
                  (mission.notes ?? []).map((n) => (
                    <Typography key={n.id} variant="body2" sx={{ mb: 0.75 }}>
                      <strong>{n.author}</strong> — {n.content}
                    </Typography>
                  ))
                )}
              </Section>

              <Section title="8. Final Outcome">
                <InfoGrid
                  items={[
                    ['Status', mission.status],
                    ['Outcome', mission.outcome ?? 'ongoing'],
                    ['Created', new Date(mission.createdAt).toLocaleString()],
                    ['Updated', new Date(mission.updatedAt).toLocaleString()],
                  ]}
                />
              </Section>

              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Official MSAR documentation · Use Export as PDF to save via the system print dialog · Report
                length {buildMissionReportHtml(mission).length.toLocaleString()} chars
              </Typography>
            </GlassCard>
          </Box>
        ) : (
          <GlassCard sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Select a mission to generate a report</Typography>
          </GlassCard>
        )}
      </Box>
    </LaptopContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ mb: 1.25, color: 'secondary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 0.75 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      {items.map(([label, value]) => (
        <Box key={label}>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
