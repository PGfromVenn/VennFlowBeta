import React, { useState, useEffect } from 'react';

const dbStatuses = [
  'to assemble',
  'assembled',
  'to be deployed',
  'active',
  'stock',
  'return RMA'
];
const statusLabels = {
  'to assemble': 'To assemble',
  'assembled': 'Assembled',
  'to be deployed': 'To be deployed',
  'active': 'Active',
  'stock': 'Stock',
  'return RMA': 'Return RMA',
  '': 'Unknown',
  undefined: 'Unknown'
};



export default function VennSupport({ code }) {
  const [serial, setSerial] = useState('');
  const [vennboxSerial, setVennboxSerial] = useState('');
  useEffect(() => {
    if (code) {
      fetch(`http://localhost:3000/users/router-status?code=${code}`)
        .then(res => res.json())
        .then(data => {
          setSerial(data?.devices?.[0]?.serial || '');
          setVennboxSerial(data?.devices?.[0]?.vennboxSerial || '');
        });
    }
  }, [code]);
  return (
    <>
      <div className="venn-card">
        <h2>Venn Support: Force device status</h2>
        <div style={{marginBottom:'4px'}}>
          <b>Box code:</b> {code}
        </div>
        {serial && (
          <div style={{marginBottom:'4px'}}><b>Serial number (Peplink):</b> {serial}</div>
        )}
        {vennboxSerial && (
          <div style={{marginBottom:'1rem'}}><b>Serial number (Vennbox):</b> {vennboxSerial}</div>
        )}
        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          {dbStatuses.map(status => (
            <button
              key={status}
              className="venn-btn venn-btn-fluo"
              onClick={async () => {
                await fetch('http://localhost:3000/users/force-status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ code, statutLogique: status })
                });
                // Optionnel: afficher un message de succès ou rafraîchir le statut
              }}
            >Force status: {statusLabels[status]}</button>
          ))}
        </div>
      </div>
      <div className="venn-card" style={{marginTop:'2rem', background:'#fff', minHeight:'120px', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <button
          className="venn-btn venn-btn-fluo"
          onClick={() => window.open('/admin-db', '_blank')}
        >View & Edit Database</button>
      </div>
    </>
  );
}
