import React, { useState } from 'react';
import ServiceLineDetails from './ServiceLineDetails';

function TelemetryModal({ line, telemetry, onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div style={{ background: '#fff', margin: '5vh auto', padding: 32, borderRadius: 12, maxWidth: 600 }}>
        <h2>Télémétrie pour {line.id}</h2>
        <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          {JSON.stringify(telemetry, null, 2)}
        </pre>
        <button onClick={onClose} style={{ marginTop: 16, background: '#1976d2', color: '#fff', padding: '8px 24px', borderRadius: 8 }}>Fermer</button>
      </div>
    </div>
  );
}

function ServiceLinesSection({ terminals, onSelectLine }) {

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Gestion des lignes de service</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Terminal</th>
            <th>Line ID</th>
            <th>Plan</th>
            <th>Active</th>
            <th>Bundle/Pool</th>
            <th>Télémétrie</th>
          </tr>
        </thead>
        <tbody>
          {terminals.map(term => term.lines.map(line => (
            <tr key={line.id}>
              <td>{term.name} ({term.id})</td>
              <td>{line.id}</td>
              <td>{line.plan}</td>
              <td>{line.active ? 'Oui' : 'Non'}</td>
              <td>{term.bundle || term.pool || '-'}</td>
              <td>
                <button onClick={() => onSelectLine(line.id)} style={{ background: '#0288d1', color: '#fff', padding: '4px 12px', borderRadius: 6 }}>
                  Détails
                </button>
              </td>
            </tr>
          )))}
        </tbody>
      </table>
  {/* La navigation est gérée par le parent */}
    </div>
  );
}

export default ServiceLinesSection;
