import React, { useState } from 'react';
import TelemetryPage from './TelemetryPage';
import StarlinkManagementPage from './StarlinkManagementPage';

function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(
    window.location.hash === '#telemetry' ? 'telemetry'
    : window.location.hash === '#starlink-management' ? 'starlink-management'
    : 'main'
  );

  React.useEffect(() => {
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#telemetry') setPage('telemetry');
      else if (window.location.hash === '#starlink-management') setPage('starlink-management');
      else setPage('main');
    });
  }, []);

  const fetchToken = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:4100/starlink/token');
      const data = await res.json();
      setToken(data);
    } catch (err) {
      setError('Erreur lors de la récupération du token');
    }
  };

  if (page === 'telemetry') {
    return <TelemetryPage />;
  }
  if (page === 'starlink-management') {
    return <StarlinkManagementPage />;
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Starlink Backend Management Portal</h1>
      <button onClick={fetchToken}>Get Starlink Token</button>
      {token && (
        <pre style={{ background: '#eee', padding: 16, marginTop: 16 }}>
          {JSON.stringify(token, null, 2)}
        </pre>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        <a href="#" onClick={() => window.location.hash = '#telemetry'}>
          Aller à la gestion de la télémétrie
        </a>
        <br />
        <a href="#" onClick={() => window.location.hash = '#starlink-management'}>
          Aller à la gestion interne Starlink
        </a>
      </div>
    </div>
  );
}

export default App;
