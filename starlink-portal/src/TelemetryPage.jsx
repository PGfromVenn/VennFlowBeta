import React, { useState } from 'react';

function TelemetryPage() {
  const [accountNumber, setAccountNumber] = useState('');
  const [telemetry, setTelemetry] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  const fetchTelemetry = async () => {
    setError(null);
    try {
      const res = await fetch(`http://localhost:4100/starlink/telemetry/history?accountNumber=${accountNumber}`);
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      setError('Erreur lors de la récupération de la télémétrie');
    }
  };

  // Filtrage simple sur les colonnes
  const filteredTelemetry = telemetry.filter(item => {
    if (!filter) return true;
    return JSON.stringify(item.telemetry).toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div style={{ padding: 32 }}>
      <h1>Starlink Telemetry Management</h1>
      <input
        type="text"
        placeholder="Account Number"
        value={accountNumber}
        onChange={e => setAccountNumber(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={fetchTelemetry}>Afficher l'historique</button>
      <input
        type="text"
        placeholder="Filtrer..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginLeft: 16 }}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 24 }}>
        {filteredTelemetry.length === 0 ? (
          <div>Aucune donnée disponible.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>DeviceId</th>
                <th>Data (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTelemetry.map((item, idx) => {
                const values = item.telemetry?.data?.values || [];
                const columns = item.telemetry?.data?.columnNamesByDeviceType || {};
                return values.map((row, i) => (
                  <tr key={idx + '-' + i}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>{row[0]}</td>
                    <td>{row[2]}</td>
                    <td>
                      <pre style={{ fontSize: 12, margin: 0 }}>{JSON.stringify(row, null, 2)}</pre>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TelemetryPage;
