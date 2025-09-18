import React from 'react';
const vennLogo = "http://localhost:3000/images/venn-logo.png";
const antennaImg = "http://localhost:3000/images/antenna-max-s.png";

export default function VennLayout({ children }) {
  return (
    <div className="venn-bg">
      <header className="venn-header">
        <img src={vennLogo} alt="Venn Telecom Logo" className="venn-logo" style={{marginLeft: 0, width: '180px', height: 'auto'}} />
      </header>
      <div className="venn-center">
        <h1 className="venn-title">
          <span className="venn-reliable">Reliable</span> <span style={{color:'#fff'}}>connectivity, anywhere</span>
        </h1>
        <img src={antennaImg} alt="Antenna Max S" style={{ width: "360px", marginBottom: "20px" }} />
        {children}
        <footer className="venn-footer">
          © 2025 Venn Telecom
        </footer>
      </div>
    </div>
  );
}
