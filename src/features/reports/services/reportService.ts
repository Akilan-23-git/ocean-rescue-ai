import type { Mission } from '@/types';
import { OBJECT_TYPES, INCIDENT_TYPES } from '@/constants';
import { formatCoordinates } from '@/utils';
import { DRIFT_MODELS, WEATHER_SOURCES, OCEAN_MODELS, AI_MODELS } from '@/constants/layout';

export function buildMissionReportHtml(mission: Mission): string {
  const objectLabel = OBJECT_TYPES.find((o) => o.value === mission.objectType)?.label ?? mission.objectType;
  const incidentLabel =
    INCIDENT_TYPES.find((i) => i.value === mission.incidentType)?.label ?? mission.incidentType;
  const sim = mission.simulationResult;
  const cfg = mission.simulationConfig;
  const search = mission.searchArea;
  const decision = mission.rescueDecision;

  const timelineRows = (mission.timeline ?? [])
    .map(
      (t) =>
        `<tr><td>${new Date(t.timestamp).toLocaleString()}</td><td>${t.title}</td><td>${t.description ?? ''}</td></tr>`,
    )
    .join('');

  const notesRows = (mission.notes ?? [])
    .map(
      (n) =>
        `<tr><td>${new Date(n.createdAt).toLocaleString()}</td><td>${n.author}</td><td>${n.content}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MSAR Report — ${mission.missionId}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #0f172a; margin: 32px; line-height: 1.5; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 28px 0 10px; border-bottom: 2px solid #1e6fd9; padding-bottom: 4px; color: #1e6fd9; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .value { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Maritime Search &amp; Rescue Formal Report</h1>
  <div class="meta">MSAR Prediction System · Generated ${new Date().toLocaleString()} UTC-equivalent local · Confidential</div>
  <span class="badge">${mission.status.toUpperCase()}</span>

  <h2>1. Mission Summary</h2>
  <div class="grid">
    <div><div class="label">Mission ID</div><div class="value">${mission.missionId}</div></div>
    <div><div class="label">Mission Name</div><div class="value">${mission.name}</div></div>
    <div><div class="label">Rescue Team</div><div class="value">${mission.rescueTeamName}</div></div>
    <div><div class="label">Incident Type</div><div class="value">${incidentLabel}</div></div>
    <div><div class="label">Object Type</div><div class="value">${objectLabel}</div></div>
    <div><div class="label">People</div><div class="value">${mission.numberOfPeople}</div></div>
    <div><div class="label">Incident Time</div><div class="value">${new Date(mission.incidentDateTime).toLocaleString()}</div></div>
    <div><div class="label">Last Known Position</div><div class="value">${
      mission.lastKnownPosition
        ? formatCoordinates(mission.lastKnownPosition.lat, mission.lastKnownPosition.lng)
        : 'Not set'
    }</div></div>
  </div>
  ${mission.additionalNotes ? `<p><strong>Notes:</strong> ${mission.additionalNotes}</p>` : ''}

  <h2>2. Simulation Details</h2>
  ${
    cfg
      ? `<div class="grid">
    <div><div class="label">Duration</div><div class="value">${cfg.durationHours}h</div></div>
    <div><div class="label">Particles</div><div class="value">${cfg.particleCount.toLocaleString()}</div></div>
    <div><div class="label">Drift Model</div><div class="value">${DRIFT_MODELS.find((m) => m.value === cfg.driftModel)?.label ?? cfg.driftModel}</div></div>
    <div><div class="label">Weather Source</div><div class="value">${WEATHER_SOURCES.find((m) => m.value === cfg.weatherSource)?.label ?? cfg.weatherSource}</div></div>
    <div><div class="label">Ocean Model</div><div class="value">${OCEAN_MODELS.find((m) => m.value === cfg.oceanModel)?.label ?? cfg.oceanModel}</div></div>
    <div><div class="label">AI Model</div><div class="value">${AI_MODELS.find((m) => m.value === cfg.aiModel)?.label ?? cfg.aiModel}</div></div>
  </div>`
      : '<p>No simulation configuration recorded.</p>'
  }

  <h2>3. Weather / Environmental Summary</h2>
  <p>Environmental conditions were evaluated at the incident location as part of Phase 3. Wind, ocean current, wave height, sea temperature, tide, and visibility informed the drift ensemble.</p>
  ${
    decision?.weatherWarnings?.length
      ? `<ul>${decision.weatherWarnings.map((w) => `<li><strong>${w.title}:</strong> ${w.message}</li>`).join('')}</ul>`
      : '<p>No weather warnings attached to this mission record.</p>'
  }

  <h2>4. Drift Prediction Report</h2>
  ${
    sim
      ? `<div class="grid">
    <div><div class="label">Drift Distance</div><div class="value">${sim.driftDistanceKm} km</div></div>
    <div><div class="label">Drift Direction</div><div class="value">${sim.driftDirection}°</div></div>
    <div><div class="label">Confidence</div><div class="value">${sim.confidenceScore}%</div></div>
    <div><div class="label">Paths Computed</div><div class="value">${sim.alternatePaths.length + 1}</div></div>
  </div>
  <p>${sim.aiExplanation}</p>`
      : '<p>No drift prediction available.</p>'
  }

  <h2>5. Search Area</h2>
  ${
    search
      ? `<div class="grid">
    <div><div class="label">Search Radius</div><div class="value">${search.searchRadiusKm.toFixed(1)} km</div></div>
    <div><div class="label">Probability Zones</div><div class="value">${search.zones.length}</div></div>
    <div><div class="label">Grid Cells</div><div class="value">${search.gridCells.length}</div></div>
    <div><div class="label">Ellipse Major/Minor</div><div class="value">${search.ellipse.semiMajorKm.toFixed(1)} / ${search.ellipse.semiMinorKm.toFixed(1)} km</div></div>
  </div>
  <ol>${search.zones
    .sort((a, b) => a.searchOrder - b.searchOrder)
    .map(
      (z) =>
        `<li>${z.level.toUpperCase()} — ${(z.probability * 100).toFixed(0)}% · ${z.radiusKm.toFixed(1)} km radius</li>`,
    )
    .join('')}</ol>`
      : '<p>Search area not generated.</p>'
  }

  <h2>6. Mission Timeline</h2>
  <table>
    <thead><tr><th>Time</th><th>Event</th><th>Details</th></tr></thead>
    <tbody>${timelineRows || '<tr><td colspan="3">No timeline events</td></tr>'}</tbody>
  </table>

  <h2>7. Team Actions</h2>
  ${
    decision
      ? `<p><strong>Closest Station:</strong> ${decision.closestStation.name} (${decision.closestStation.distanceKm} km, ETA ${decision.closestStation.etaMinutes} min)</p>
  <p><strong>Nearest Vessel:</strong> ${decision.nearestVessel.name} (${decision.nearestVessel.callSign})</p>
  <ol>${decision.aiRecommendations.map((r) => `<li>${r}</li>`).join('')}</ol>`
      : '<p>No decision-support actions recorded.</p>'
  }
  <table>
    <thead><tr><th>Time</th><th>Author</th><th>Note / Action</th></tr></thead>
    <tbody>${notesRows || '<tr><td colspan="3">No team notes</td></tr>'}</tbody>
  </table>

  <h2>8. Final Outcome</h2>
  <div class="grid">
    <div><div class="label">Status</div><div class="value">${mission.status}</div></div>
    <div><div class="label">Outcome</div><div class="value">${mission.outcome ?? 'ongoing'}</div></div>
    <div><div class="label">Created</div><div class="value">${new Date(mission.createdAt).toLocaleString()}</div></div>
    <div><div class="label">Last Updated</div><div class="value">${new Date(mission.updatedAt).toLocaleString()}</div></div>
  </div>

  <div class="footer">
    Official MSAR rescue documentation · ${mission.missionId} · Not for public distribution without authorization.
  </div>
</body>
</html>`;
}

export function downloadReportHtml(mission: Mission): void {
  const html = buildMissionReportHtml(mission);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mission.missionId}-report.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printMissionReport(mission: Mission): void {
  const html = buildMissionReportHtml(mission);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}
