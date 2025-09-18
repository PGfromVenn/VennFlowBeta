import React, { useState, useEffect } from 'react';
import ServiceLinesSection from './ServiceLinesSection';
import ServiceLineDetails from './ServiceLineDetails';

// Mock data for Starlink terminals and service lines
const mockTerminals = [
  {
    id: 'TERM-001',
    name: 'Terminal 1',
    status: 'active',
    lines: [
      { id: 'LINE-001', plan: 'Standard', active: true },
      { id: 'LINE-002', plan: 'Premium', active: false }
    ]
  },
  {
    id: 'TERM-002',
    name: 'Terminal 2',
    status: 'inactive',
    lines: [
      { id: 'LINE-003', plan: 'Standard', active: false }
    ]
  }
];

function StarlinkManagementPage() {
  const [selectedServiceLineId, setSelectedServiceLineId] = useState(null);
  // Gestion des pools
  const [pools, setPools] = useState([
    // Exemple de pool
    { id: 'POOL-001', name: 'Pool Maritime', description: 'Pool pour flotte maritime', terminals: ['TERM-001'] }
  ]);
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolDesc, setNewPoolDesc] = useState('');
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedTerminalsForPool, setSelectedTerminalsForPool] = useState([]);
  // Création d'un pool
  const handleCreatePool = (e) => {
    e.preventDefault();
    const newId = 'POOL-' + (pools.length + 1).toString().padStart(3, '0');
    setPools([...pools, { id: newId, name: newPoolName, description: newPoolDesc, terminals: [] }]);
    setShowPoolForm(false);
    setNewPoolName('');
    setNewPoolDesc('');
  };

  // Association de terminaux à un pool
  const handleAssociateTerminals = () => {
    if (!selectedPool) return;
    setPools(pools.map(pool =>
      pool.id === selectedPool.id
        ? { ...pool, terminals: selectedTerminalsForPool }
        : pool
    ));
    setSelectedPool(null);
    setSelectedTerminalsForPool([]);
  };
  const [terminals, setTerminals] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [filter, setFilter] = useState('');
  const [showActivationForm, setShowActivationForm] = useState(false);
  // Liste dynamique d'IDs disponibles (non activés)
  const allIds = ['TERM-003', 'TERM-004', 'TERM-005', 'TERM-006', 'TERM-007'];
  const activatedIds = terminals.map(t => t.id);
  const availableIds = allIds.filter(id => !activatedIds.includes(id));
  const [newTerminalId, setNewTerminalId] = useState(availableIds[0] || '');
  const [newBundle, setNewBundle] = useState('');
  const [newTerminalName, setNewTerminalName] = useState('');
  const [newTerminalPlan, setNewTerminalPlan] = useState('Standard');

  useEffect(() => {
    // TODO: Replace with API call
    setTerminals(mockTerminals);
  }, []);

  const handleLineSelect = (terminalId, lineId) => {
    const key = `${terminalId}:${lineId}`;
    setSelectedLines(selectedLines.includes(key)
      ? selectedLines.filter(k => k !== key)
      : [...selectedLines, key]
    );
  };

  const handleActivate = () => {
    // TODO: API call to activate selected lines
    alert('Activation demandée pour: ' + selectedLines.join(', '));
  };

  const handleChangePlan = () => {
    // TODO: API call to change plan for selected lines
    alert('Changement de plan pour: ' + selectedLines.join(', '));
  };

  const handleNewTerminal = (e) => {
    e.preventDefault();
    // TODO: API call to activate new Starlink terminal
    if (!newTerminalId) {
      alert('Aucun ID disponible');
      return;
    }
    const newTerm = {
      id: newTerminalId,
      name: newTerminalName,
      status: 'active',
      bundle: newBundle,
      lines: [
        { id: `${newTerminalId}-LINE-1`, plan: 'Entreprise', active: true, bundle: newBundle }
      ]
    };
    setTerminals([...terminals, newTerm]);
    setShowActivationForm(false);
    setNewTerminalId(availableIds[1] || '');
    setNewTerminalName('');
    setNewBundle('');
    alert('Nouveau Starlink Entreprise activé !');
  };

  // Filtrage simple
  const filteredTerminals = terminals.filter(t =>
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.id.toLowerCase().includes(filter.toLowerCase())
  );

  const activeTerminals = terminals.filter(t => t.status === 'active');

  return (
  <div style={{ padding: 32 }}>
      {/* Section gestion des lignes de service et télémétrie */}
      {selectedServiceLineId ? (
        <ServiceLineDetails lineId={selectedServiceLineId} />
      ) : (
        <ServiceLinesSection terminals={terminals} onSelectLine={setSelectedServiceLineId} />
      )}
      {/* Section Pools */}
      <div style={{ marginBottom: 40, background: '#e3f2fd', padding: 24, borderRadius: 12 }}>
        <h2>Gestion des Pools</h2>
        <button onClick={() => setShowPoolForm(true)} style={{ marginBottom: 16, background: '#1976d2', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>Créer un nouveau pool</button>
        {showPoolForm && (
          <form onSubmit={handleCreatePool} style={{ marginBottom: 16, background: '#f5f5f5', padding: 16, borderRadius: 8, maxWidth: 400 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Nom du pool&nbsp;: <input required value={newPoolName} onChange={e => setNewPoolName(e.target.value)} style={{ width: '70%' }} /></label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Description&nbsp;: <input value={newPoolDesc} onChange={e => setNewPoolDesc(e.target.value)} style={{ width: '70%' }} /></label>
            </div>
            <button type="submit" style={{ background: '#43a047', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>Créer</button>
            <button type="button" onClick={() => setShowPoolForm(false)} style={{ marginLeft: 16, background: '#d32f2f', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>Annuler</button>
          </form>
        )}
        <div style={{ marginTop: 16 }}>
          <h3>Pools existants</h3>
          <ul>
            {pools.map(pool => (
              <li key={pool.id} style={{ marginBottom: 8 }}>
                <b>{pool.name}</b> ({pool.id})<br />
                <span style={{ fontSize: '0.95em' }}>{pool.description}</span><br />
                <span style={{ fontSize: '0.95em' }}>Terminaux associés : {pool.terminals.length ? pool.terminals.join(', ') : 'Aucun'}</span><br />
                <button onClick={() => { setSelectedPool(pool); setSelectedTerminalsForPool(pool.terminals); }} style={{ marginTop: 4, background: '#0288d1', color: '#fff', padding: '4px 12px', borderRadius: 6 }}>Associer des terminaux</button>
              </li>
            ))}
          </ul>
        </div>
        {selectedPool && (
          <div style={{ marginTop: 16, background: '#fffde7', padding: 16, borderRadius: 8 }}>
            <h4>Associer des terminaux au pool <b>{selectedPool.name}</b></h4>
            <div style={{ marginBottom: 8 }}>
              {terminals.map(term => (
                <label key={term.id} style={{ marginRight: 16 }}>
                  <input
                    type="checkbox"
                    checked={selectedTerminalsForPool.includes(term.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedTerminalsForPool([...selectedTerminalsForPool, term.id]);
                      else setSelectedTerminalsForPool(selectedTerminalsForPool.filter(id => id !== term.id));
                    }}
                  />
                  {term.name} ({term.id})
                </label>
              ))}
            </div>
            <button onClick={handleAssociateTerminals} style={{ background: '#43a047', color: '#fff', padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>Valider</button>
            <button onClick={() => { setSelectedPool(null); setSelectedTerminalsForPool([]); }} style={{ marginLeft: 12, background: '#d32f2f', color: '#fff', padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>Annuler</button>
          </div>
        )}
      </div>
      <h1>Starlink Management (Interne)</h1>
      <button onClick={() => setShowActivationForm(true)} style={{ marginBottom: 24, background: '#1976d2', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600 }}>
        Activer un nouveau Starlink
      </button>
      {showActivationForm && (
        <form onSubmit={handleNewTerminal} style={{ marginBottom: 32, background: '#f5f5f5', padding: 24, borderRadius: 12, maxWidth: 400 }}>
          <h2>Activation d'un nouveau Starlink</h2>
          <div style={{ marginBottom: 12 }}>
            <label>ID du terminal&nbsp;:
              <select value={newTerminalId} onChange={e => setNewTerminalId(e.target.value)} style={{ width: '70%', marginLeft: 8 }} required>
                {availableIds.length === 0 && <option value="">Aucun ID disponible</option>}
                {availableIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Nom du terminal&nbsp;: <input required value={newTerminalName} onChange={e => setNewTerminalName(e.target.value)} style={{ width: '70%' }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Plan&nbsp;: <b>Entreprise</b></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Bundle&nbsp;: <input value={newBundle} onChange={e => setNewBundle(e.target.value)} style={{ width: '70%' }} placeholder="Nom du bundle ou référence" /></label>
          </div>
          <button type="submit" style={{ background: '#43a047', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>Activer</button>
          <button type="button" onClick={() => setShowActivationForm(false)} style={{ marginLeft: 16, background: '#d32f2f', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>Annuler</button>
        </form>
      )}
      <input
        type="text"
        placeholder="Filtrer par nom ou ID..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Terminal ID</th>
            <th>Nom</th>
            <th>Status</th>
            <th>Lignes de service</th>
          </tr>
        </thead>
        <tbody>
          {filteredTerminals.map(term => (
            <tr key={term.id}>
              <td>{term.id}</td>
              <td>{term.name}</td>
              <td>{term.status}</td>
              <td>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Sélection</th>
                      <th>Line ID</th>
                      <th>Plan</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {term.lines.map(line => {
                      const key = `${term.id}:${line.id}`;
                      return (
                        <tr key={line.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedLines.includes(key)}
                              onChange={() => handleLineSelect(term.id, line.id)}
                            />
                          </td>
                          <td>{line.id}</td>
                          <td>{line.plan}</td>
                          <td>{line.active ? 'Oui' : 'Non'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleActivate} disabled={selectedLines.length === 0} style={{ marginRight: 16 }}>
        Activer les lignes sélectionnées
      </button>
      <button onClick={handleChangePlan} disabled={selectedLines.length === 0}>
        Changer le plan des lignes sélectionnées
      </button>
      <div style={{ marginTop: 40 }}>
        <h2>Liste des Starlink actifs</h2>
        <ul>
          {activeTerminals.map(term => (
            <li key={term.id} style={{ marginBottom: 8 }}>
              <b>{term.name}</b> ({term.id}) - Plan: {term.lines[0]?.plan}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StarlinkManagementPage;
