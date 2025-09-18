
import React from 'react';

export default function Installer({ code }) {
  const [activationCode, setActivationCode] = React.useState('');
  const [serial, setSerial] = React.useState('');
  React.useEffect(() => {
    if (code) {
      // Va chercher le serial correspondant au code
      fetch(`http://localhost:3000/users/all-vennboxes`)
        .then(res => res.json())
        .then(data => {
          const found = (data.vennboxes || []).find(vb => vb.code === code);
          setSerial(found ? found.serial : '');
        });
    }
  }, [code]);
  return (
    <div className="venn-card">
      <h2>Router installation</h2>
      <div style={{marginBottom:'1rem'}}>
        <b>Box code:</b> {code}<br/>
        <b>Serial:</b> {serial}<br/>
        <b>Status:</b> To be deployed
      </div>
      <div style={{marginBottom:'1rem'}}>
        <b>Installation videos:</b>
        <ul>
          <li><a href="https://www.youtube.com/watch?v=QKQw1b6pQ1A" target="_blank" rel="noopener noreferrer">Peplink MAX BR1 Installation</a></li>
          <li><a href="https://www.youtube.com/watch?v=QKQw1b6pQ1A" target="_blank" rel="noopener noreferrer">Starlink Installation</a></li>
        </ul>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <label htmlFor="activationCode"><b>Installation activation code:</b></label><br/>
        <input
          id="activationCode"
          type="text"
          className="venn-input"
          placeholder="Enter activation code"
          value={activationCode}
          onChange={e => setActivationCode(e.target.value)}
          style={{marginTop:'0.5rem'}}
        />
      </div>
      <button
        className="venn-btn venn-btn-fluo"
        style={{marginTop:'1rem'}}
        onClick={async () => {
          if (!activationCode || !serial) return;
          const res = await fetch('http://localhost:3000/users/activate-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial, activationCode })
          });
          const data = await res.json();
          if (data.success) {
            alert('Activation successful!');
          } else {
            alert(data.error || 'Activation failed');
          }
        }}
      >Validate installation</button>
    </div>
  );
}
