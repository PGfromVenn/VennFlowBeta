
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Use previous logo and antenna images served from backend
const vennLogo = "http://localhost:3000/images/venn-logo.png";
const antennaImg = "http://localhost:3000/images/antenna-max-s.png";
import './App.css';
import { MobileIcon, StarlinkIcon, RoutingIcon } from './assets/wanIcons';
import VennSupport from './pages/VennSupport';
import Installer from './pages/Installer';
import Warehouse from './pages/Warehouse';
import Customer from './pages/Customer';

function App({ code }) {
  const [internalCode, setInternalCode] = useState(code || '');
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [page, setPage] = useState('main');
  const navigate = useNavigate();
  const [activationCode, setActivationCode] = useState('');
  const [starlinkStatus, setStarlinkStatus] = useState([]);

  useEffect(() => {
    if (internalCode) {
      fetch(`http://localhost:3000/users/router-status?code=${internalCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setStatusError(data.error);
            setDeviceStatus(null);
          } else {
            setDeviceStatus(data);
            setStatusError(null);
          }
        })
        .catch(() => {
          setDeviceStatus(null);
          setStatusError('Erreur de connexion au backend');
        });
      // Récupère le statut Starlink
      fetch('http://localhost:3000/starlink/starlink-fleet-status')
        .then(res => res.json())
        .then(data => {
          setStarlinkStatus(data.starlink || []);
        })
        .catch(() => setStarlinkStatus([]));
    }
  }, [internalCode]);

  // Status mapping
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

  // Device status block
  let deviceStatusBlock = null;
  if (internalCode) {
    let statutLogique = deviceStatus?.devices?.[0]?.statutLogique || '';
    let displayStatut = statusLabels[statutLogique] || 'Unknown';
    let lanIp = deviceStatus?.devices?.[0]?.lan?.ip || null;
    deviceStatusBlock = (
      <div className="venn-serial">
        <div style={{marginBottom:'4px'}}><b style={{color:'#111'}}>Box code:</b> {internalCode}</div>
        {deviceStatus?.devices?.[0]?.serial && (
          <div style={{marginBottom:'4px'}}><b style={{color:'#111'}}>Serial number (Peplink):</b> {deviceStatus.devices[0].serial}</div>
        )}
        {deviceStatus?.devices?.[0]?.vennboxSerial && (
          <div style={{marginBottom:'8px'}}><b style={{color:'#111'}}>Serial number (Vennbox):</b> {deviceStatus.devices[0].vennboxSerial}</div>
        )}
        {statusError && (
          <div className="venn-status" style={{ color: '#d50000', marginTop: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#888',
                border: '1px solid #888',
                marginRight: '8px',
              }}
              title="Unavailable"
            ></span>
            <b>Status:</b> Unavailable
            <div style={{ fontSize: '0.9em', marginTop: '4px' }}>{statusError}</div>
          </div>
        )}
        {deviceStatus && deviceStatus.devices && deviceStatus.devices.length > 0 && (
          <div className="venn-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: deviceStatus.devices[0].online ? '#00c853' : '#d50000',
                  border: '1px solid #888',
                }}
                title={displayStatut}
              ></span>
              <b style={{color:'#111'}}>Technical status:</b> {deviceStatus.devices[0].online ? <span style={{color:'#006400', fontWeight:'bold'}}>Online</span> : 'Offline'}
            </div>
            <div style={{marginTop:'8px'}}>
              <b style={{color:'#111'}}>Vennbox commercial state:</b> <span style={{color:'#111', fontWeight:'bold'}}>{displayStatut}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src={RoutingIcon} alt="IP Routing" style={{width:18,height:18,verticalAlign:'middle'}} />
              <b style={{color:'#111'}}>WAN IP:</b> <span style={{color:'#111'}}>{deviceStatus.devices[0].wan?.ip !== null ? deviceStatus.devices[0].wan.ip : <span style={{color:'#d50000'}}>Not assigned</span>}</span>
            </div>


            {/* Affichage détails Starlink si présents */}
            {deviceStatus.devices[0].wan?.details && (
              <div style={{marginTop:'8px', marginBottom:'8px', display:'flex',alignItems:'flex-start',gap:8}}>
                <img src={StarlinkIcon} alt="Starlink (LEO)" style={{width:18,height:18,verticalAlign:'middle',marginTop:2}} />
                <div>
                  <b style={{color:'#111'}}>Starlink WAN status:</b>
                  <ul style={{margin:'6px 0 0 0', padding:'0 0 0 16px'}}>
                    {deviceStatus.devices[0].wan.details.status && (() => {
                      const st = deviceStatus.devices[0].wan.details.status;
                      let color = '#888';
                      if (/connected|online/i.test(st)) color = '#006400';
                      else if (/outage|disconnected|booting|fail|error/i.test(st)) color = '#d50000';
                      else if (/degraded|warning|unstable/i.test(st)) color = '#ff9800';
                      return (
                        <li style={color === '#006400' ? {color:'#006400', fontWeight:'bold'} : {color}}>
                          <b>Status:</b> {st}
                        </li>
                      );
                    })()}

                  </ul>
                </div>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src={MobileIcon} alt="Mobile" style={{width:18,height:18,verticalAlign:'middle'}} />
              <b style={{color:'#111'}}>Cellular:</b> {deviceStatus.devices[0].cellular?.status ? <span style={{color:'#006400'}}>{deviceStatus.devices[0].cellular.status}</span> : <span style={{color:'#d50000'}}>Not connected</span>}
            </div>
            {/* Affichage Starlink WAN */}

          </div>
        )}
      </div>
    );
  }

  // Role buttons
  let roleButtons = null;
  let statutLogique = null;
  // Le code n'est plus un serial, on ne fait plus de startsWith
  statutLogique = deviceStatus?.devices?.[0]?.statutLogique || '';
  const demoStatut = statutLogique;
  roleButtons = (
    <div className="venn-role-btns">
  <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/support?code=${internalCode}`)}>I am Venn support</button>
      {demoStatut === 'to assemble' && (
  <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/warehouse?code=${internalCode}`)}>I am in the warehouse</button>
      )}
      {demoStatut === 'assembled' && (
  <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/warehouse?code=${internalCode}`)}>I am in the warehouse</button>
      )}
      {demoStatut === 'to be deployed' && (
        <>
          <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/installer?code=${internalCode}`)}>I am an installer</button>
          <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/customer?code=${internalCode}`)}>I am the customer</button>
        </>
      )}
      {!['to assemble','assembled','to be deployed'].includes(demoStatut) && (
        <>
          <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/warehouse?code=${internalCode}`)}>I am in the warehouse</button>
          <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/installer?code=${internalCode}`)}>I am an installer</button>
          <button className="venn-btn venn-btn-fluo" onClick={() => navigate(`/customer?code=${internalCode}`)}>I am the customer</button>
        </>
      )}
    </div>
  );

  return (
    <>
      {deviceStatusBlock}
      <div className="venn-card">
        <h2>Router management portal</h2>
        {roleButtons}
      </div>
    </>
  );
}

export default App;
