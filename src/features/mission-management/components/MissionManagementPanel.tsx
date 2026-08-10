import { useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArchiveIcon from '@mui/icons-material/Archive';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TimelineIcon from '@mui/icons-material/Timeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReplayIcon from '@mui/icons-material/Replay';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import {
  useMissions,
  useSetMissionStatus,
  useAddMissionNote,
  useAddMissionAttachment,
} from '@/features/mission/hooks/useMissions';
import { missionService } from '@/features/mission/services/missionService';
import { OBJECT_TYPES } from '@/constants';
import type { Mission, MissionStatus } from '@/types';
import { formatCoordinates } from '@/utils';

type TabFilter = 'all' | 'active' | 'completed' | 'cancelled' | 'archived';

function missionNextRoute(m: Mission): string {
  if (!m.lastKnownPosition) return `/missions/${m.id}/location`;
  if (!m.simulationResult) return `/missions/${m.id}/simulation`;
  if (!m.searchArea) return `/missions/${m.id}/search-area`;
  return `/missions/${m.id}/tracking`;
}

export function MissionManagementPanel() {
  const navigate = useNavigate();
  const { data: missions = [], refetch } = useMissions();
  const setStatus = useSetMissionStatus();
  const addNote = useAddMissionNote();
  const addAttachment = useAddMissionAttachment();

  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filtered = useMemo(() => {
    let list = missions;
    if (tab === 'active')
      list = list.filter(
        (m) =>
          m.status === 'active' ||
          m.status === 'simulating' ||
          m.status === 'new_emergency' ||
          m.status === 'needs_review',
      );
    else if (tab !== 'all') list = list.filter((m) => m.status === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.missionId.toLowerCase().includes(q) ||
          m.rescueTeamName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [missions, tab, search]);

  const selected = missions.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  const handleSearch = (value: string) => {
    setSearch(value);
    if (selected && value.trim()) {
      missionService.addSearchHistory(selected.id, value.trim());
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    const reader = new FileReader();
    reader.onload = () => {
      addAttachment.mutate(
        {
          id: selected.id,
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
          },
        },
        { onSuccess: () => refetch() },
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const statusAction = (status: MissionStatus, outcome?: 'rescued' | 'cancelled' | 'not_found') => {
    if (!selected) return;
    setStatus.mutate({ id: selected.id, status, outcome }, { onSuccess: () => refetch() });
  };

  return (
    <LaptopContainer>
      <PageHeader
        title="Mission Management"
        subtitle="Organize active, completed, cancelled, and archived rescue operations"
        badge={<PhaseIndicator currentPhase={9} totalPhases={13} label="Mission Management" />}
        action={
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => navigate('/missions/new')}>
            New Mission
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 2.5 }}>
        <Box>
          <GlassCard sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search missions, teams, IDs…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0, fontSize: '0.8rem' } }}
              >
                <Tab label="All" value="all" />
                <Tab label="Active" value="active" />
                <Tab label="Completed" value="completed" />
                <Tab label="Cancelled" value="cancelled" />
                <Tab label="Archived" value="archived" />
              </Tabs>
            </Box>
          </GlassCard>

          <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  No missions in this category
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/missions/new')}>
                  Create Mission
                </Button>
              </Box>
            ) : (
              filtered.map((m) => (
                <Box
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: selected?.id === m.id ? (theme) => alpha(theme.palette.secondary.main, 0.08) : 'transparent',
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={600}>{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.missionId} · {m.rescueTeamName} ·{' '}
                        {OBJECT_TYPES.find((o) => o.value === m.objectType)?.label}
                        {m.lastKnownPosition &&
                          ` · ${formatCoordinates(m.lastKnownPosition.lat, m.lastKnownPosition.lng)}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={m.triggerType ?? 'MANUAL'}
                        color={m.triggerType === 'SMS' ? 'error' : 'default'}
                        variant="outlined"
                      />
                      <StatusChip status={m.status} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(missionNextRoute(m));
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </GlassCard>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selected ? (
            <>
              <GlassCard sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {selected.name}
                  </Typography>
                  <StatusChip status={selected.status} />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Assigned team: <strong>{selected.rescueTeamName}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Outcome: {selected.outcome ?? 'ongoing'} · Updated{' '}
                  {new Date(selected.updatedAt).toLocaleString()}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<CheckCircleIcon />} onClick={() => statusAction('completed', 'rescued')}>
                    Complete
                  </Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => statusAction('cancelled', 'cancelled')}>
                    Cancel
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<ArchiveIcon />} onClick={() => statusAction('archived')}>
                    Archive
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ReplayIcon />}
                    onClick={() => navigate(`/missions/${selected.id}/replay`)}
                    disabled={!selected.simulationResult}
                  >
                    Replay
                  </Button>
                </Box>
              </GlassCard>

              <GlassCard sx={{ p: 2.5, maxHeight: 220, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimelineIcon fontSize="small" color="secondary" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Mission Timeline
                  </Typography>
                </Box>
                {(selected.timeline ?? []).length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No timeline events yet
                  </Typography>
                ) : (
                  [...(selected.timeline ?? [])].reverse().map((ev) => (
                    <Box key={ev.id} sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {ev.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ev.timestamp).toLocaleString()}
                        {ev.description ? ` · ${ev.description}` : ''}
                      </Typography>
                    </Box>
                  ))
                )}
              </GlassCard>

              <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Mission Notes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Add operational note…"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<NoteAddIcon />}
                    disabled={!noteText.trim()}
                    onClick={() => {
                      addNote.mutate(
                        { id: selected.id, content: noteText.trim() },
                        {
                          onSuccess: () => {
                            setNoteText('');
                            refetch();
                          },
                        },
                      );
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <List dense disablePadding sx={{ maxHeight: 120, overflow: 'auto' }}>
                  {(selected.notes ?? []).slice().reverse().map((n) => (
                    <ListItem key={n.id} disablePadding sx={{ mb: 0.75 }}>
                      <ListItemText
                        primary={n.content}
                        secondary={`${n.author} · ${new Date(n.createdAt).toLocaleString()}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </GlassCard>

              <GlassCard sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Photos / Documents
                  </Typography>
                  <Button component="label" size="small" startIcon={<AttachFileIcon />}>
                    Attach
                    <input hidden type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFile} />
                  </Button>
                </Box>
                {(selected.attachments ?? []).length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No attachments
                  </Typography>
                ) : (
                  (selected.attachments ?? []).map((a) => (
                    <Box key={a.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {a.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(a.size / 1024).toFixed(1)} KB · {new Date(a.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          missionService.removeAttachment(selected.id, a.id);
                          refetch();
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                )}

                {(selected.searchHistory ?? []).length > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      SEARCH HISTORY
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                      {(selected.searchHistory ?? []).map((q) => (
                        <Chip key={q} label={q} size="small" onClick={() => setSearch(q)} />
                      ))}
                    </Box>
                  </>
                )}
              </GlassCard>
            </>
          ) : (
            <GlassCard sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Select a mission to manage details</Typography>
            </GlassCard>
          )}
        </Box>
      </Box>
    </LaptopContainer>
  );
}
