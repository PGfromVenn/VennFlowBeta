import React, { useEffect, useState } from 'react';

function generateMockTelemetry(lineId) {
  // Génère des données RX/TX sur 24h
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => ({
    time: new Date(now - (23 - i) * 3600 * 1000).toLocaleTimeString(),
    rx: Math.round(Math.random() * 100 + 50),
    tx: Math.round(Math.random() * 80 + 30),
    status: 'OK'
  }));
}

function ServiceLineDetails({ lineId }) {
  const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
    // TODO: Replace with API call
    setTelemetry(generateMockTelemetry(lineId));
  }, [lineId]);

  return (
    <div style={{ padding: 32 }}>
      <h1>Détails de la ligne {lineId}</h1>
      <div style={{ marginBottom: 24 }}>
        <b>Historique RX/TX (24h)</b>
        <BarChart data={telemetry} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <b>Tableau brut</b>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Heure</th>
              <th>RX</th>
              <th>TX</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {telemetry.map((row, idx) => (
              <tr key={idx}>
                <td>{row.time}</td>
                <td>{row.rx}</td>
                <td>{row.tx}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const canvasRef = React.useRef();
  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data)) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 600, 180);
    const maxVal = Math.max(...data.map(d => d.rx + d.tx), 1);
    data.forEach((d, i) => {
      const x = 20 + i * 22;
      const rxHeight = (d.rx / maxVal) * 140;
      const txHeight = (d.tx / maxVal) * 140;
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(x, 160 - rxHeight, 8, rxHeight);
      ctx.fillStyle = '#43a047';
      ctx.fillRect(x + 10, 160 - txHeight, 8, txHeight);
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      if (i % 2 === 0) ctx.fillText(d.time.split(':')[0] + 'h', x, 175);
    });
  }, [data]);
  return <canvas ref={canvasRef} width={600} height={180} style={{ background: '#f9f9f9', borderRadius: 8 }} />;
}

export default ServiceLineDetails;
