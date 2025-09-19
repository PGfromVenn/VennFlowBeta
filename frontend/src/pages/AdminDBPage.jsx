
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

const statutOptions = [
  'to assemble',
  'assembled',
  'to be deployed',
  'active',
  'stock',
  'return RMA'
];


export default function AdminDBPage() {
  const [vennboxes, setVennboxes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allVennboxFields, setAllVennboxFields] = useState([]);
  const deviceFields = [
    { key: 'supplier', label: 'Supplier' },
    { key: 'serial', label: 'Serial' }
  ];
  const supplierOptions = {
    'routeur': ['Peplink', 'Teltonika'],
    'LEO': ['Starlink', 'Kuiper']
  };

  useEffect(() => {
    fetch('http://localhost:3000/users/all-vennboxes')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error('HTTP ' + res.status + ': ' + text);
        }
        return res.json();
      })
      .then(data => {
        if (!data.vennboxes || !Array.isArray(data.vennboxes) || data.vennboxes.length === 0) {
          setError('Aucune donnée reçue de la base (ou structure inattendue) : ' + JSON.stringify(data));
          setLoading(false);
          return;
        }
        setVennboxes(data.vennboxes);
        // Collect all unique fields for vennbox (hors routeur/LEO)
        const vennboxFields = new Set();
        data.vennboxes.forEach(vb => {
          Object.keys(vb).forEach(f => {
            if (!['_id','__v','routeur','LEO','statutLogique'].includes(f)) vennboxFields.add(f);
          });
        });
        vennboxFields.delete('devices');
        setAllVennboxFields(Array.from(vennboxFields));
        setLoading(false);
      })
      .catch((err) => {
        setError('Erreur lors du chargement de la base : ' + err.message);
        setLoading(false);
      });
  }, []);

  const handleEdit = (vennbox) => {
    setEditId(vennbox._id);
    setEditData({ ...vennbox });
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleDeviceChange = (devKey, field, value) => {
    setEditData({
      ...editData,
      [devKey]: {
        ...((editData[devKey]) || {}),
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    // Vérification minimale
    if (!editData.routeur?.supplier && !editData.LEO?.supplier) {
      alert('Au moins un device doit avoir un supplier.');
      return;
    }
    const res = await fetch('http://localhost:3000/users/update-vennbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vennboxId: editData._id, update: editData })
    });
    const data = await res.json();
    if (data.success) {
      const newVennboxes = vennboxes.map((v) => v._id === editId ? data.vennbox : v);
      setVennboxes(newVennboxes);
      setEditId(null);
    } else {
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <div className="venn-card">Chargement...</div>;
  if (error) return <div className="venn-card" style={{color:'red'}}>{error}</div>;

  return (
    <div style={{width: '100vw', minWidth:0, margin: 0, padding: 0, overflowX:'auto', maxHeight: '88vh', overflowY: 'auto', position: 'relative', fontSize:'1.12em', background: 'white', boxSizing:'border-box', borderRadius:0, boxShadow:'none'}}>
      <h2 style={{position:'sticky', top:0, background:'#fff', zIndex:2, margin:0, padding:'1.5rem 0 1rem 2vw', textAlign:'left', fontSize:'2em'}}>Vennbox Database</h2>
      <table style={{width:'100vw', minWidth:0, borderCollapse:'separate', borderSpacing:'0 0.7em', background:'none', position:'relative', fontSize:'1.12em', borderRadius:0, boxShadow:'none'}}>
        <thead>
          <tr>
            <th style={{padding:'14px 24px'}}>QR</th>
            {allVennboxFields.map(f => <th key={f} style={{padding:'14px 24px', fontWeight:600}}>{f}</th>)}
            <th style={{padding:'14px 24px', fontWeight:600}}>statutLogique</th>
            {/* <th style={{padding:'14px 24px'}}>Type</th> */}
            {deviceFields.map(df => <th key={df.key} style={{padding:'14px 24px', fontWeight:600}}>{df.label}</th>)}
            <th style={{padding:'14px 24px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vennboxes.map((vb, idx) => {
            return ['routeur', 'LEO'].map(devKey => {
              const dev = vb[devKey] || {};
              return (
                <tr key={vb._id + '-' + devKey} style={editId === vb._id ? {background:'#f5f5f5'} : {}}>
                  {/* QR code (rowspan) */}
                  {devKey === 'routeur' && (
                    <td rowSpan={2} style={{textAlign:'center', padding:'8px 10px'}}><SmallQr code={vb.code} /></td>
                  )}
                  {/* Vennbox fields (rowspan) */}
                  {allVennboxFields.map(f => devKey === 'routeur' ? (
                    <td key={f} rowSpan={2} style={{padding:'10px 18px', background:'#fafbfc'}}>
                      {editId === vb._id ? (
                        <input value={editData[f] || ''} onChange={e => handleChange(f, e.target.value)} style={{width:'99%', padding:'7px 10px', fontSize:'1em', border:'1px solid #bbb', borderRadius:4}} />
                      ) : (
                        (typeof vb[f] === 'string' || typeof vb[f] === 'number' || typeof vb[f] === 'boolean' || vb[f] == null)
                          ? (vb[f] || '')
                          : JSON.stringify(vb[f])
                      )}
                    </td>
                  ) : null)}
                  {devKey === 'routeur' ? (
                    <td rowSpan={2} style={{padding:'10px 18px', background:'#346699ff'}}>
                      {editId === vb._id ? (
                        <select value={editData.statutLogique || ''} onChange={e => handleChange('statutLogique', e.target.value)} style={{padding:'7px 10px', fontSize:'1em', border:'1px solid #bbb', borderRadius:4}}>
                          <option value="">-- Choisir --</option>
                          {statutOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{fontWeight:600, color: vb.statutLogique ? '#222' : '#aaa'}}>
                          {vb.statutLogique || '—'}
                        </span>
                      )}
                    </td>
                  ) : null}
                  {/* Type (routeur/LEO) supprimé */}
                  {/* Device fields */}
                  {deviceFields.map(df => (
                    <td key={df.key} style={{padding:'10px 18px', background:'#f6f8fa'}}>
                      {editId === vb._id ? (
                        df.key === 'supplier' ? (
                          <select value={editData[devKey]?.supplier || ''} onChange={e => handleDeviceChange(devKey, 'supplier', e.target.value)} style={{padding:'7px 10px', fontSize:'1em', border:'1px solid #bbb', borderRadius:4}}>
                            <option value="">-- Choisir --</option>
                            {(supplierOptions[devKey] || []).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : df.key === 'statutLogique' ? (
                          <select value={editData[devKey]?.statutLogique || ''} onChange={e => handleDeviceChange(devKey, 'statutLogique', e.target.value)} style={{padding:'7px 10px', fontSize:'1em', border:'1px solid #bbb', borderRadius:4}}>
                            <option value="">-- Choisir --</option>
                            {statutOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input value={editData[devKey]?.[df.key] || ''} onChange={e => handleDeviceChange(devKey, df.key, e.target.value)} style={{width:'99%', padding:'7px 10px', fontSize:'1em', border:'1px solid #bbb', borderRadius:4}} />
                        )
                      ) : (
                        (dev[df.key] && typeof dev[df.key] === 'string') ? dev[df.key] : (dev[df.key] ? String(dev[df.key]) : '—')
                      )}
                    </td>
                  ))}
                  {/* Actions (rowspan) */}
                  {devKey === 'routeur' && (
                    <td rowSpan={2} style={{padding:'10px 18px'}}>
                      {editId === vb._id ? (
                        <>
                          <button className="venn-btn" onClick={handleSave} style={{marginBottom:6}}>Save</button>
                          <button className="venn-btn" onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="venn-btn" onClick={() => handleEdit(vb)}>Edit</button>
                      )}
                    </td>
                  )}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
}

function SmallQr({ code }) {
  const [show, setShow] = React.useState(false);
  if (!code) return null;
  const url = `https://easy.venntelecom.com/?code=${encodeURIComponent(code)}`;
  return (
    <>
      <div style={{cursor:'pointer', display:'inline-block'}} onClick={() => setShow(true)}>
  <QRCode value={url} size={32} />
      </div>
      {show ? (
        <div onClick={() => setShow(false)} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', padding:24, borderRadius:8, boxShadow:'0 2px 16px #0008'}}>
            <QRCode value={url} size={256} />
            <div style={{textAlign:'center', marginTop:8}}>
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            </div>
            <button className="venn-btn" style={{marginTop:16}} onClick={() => setShow(false)}>Fermer</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
