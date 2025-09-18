import React from 'react';

export default function Customer({ code }) {
  return (
    <div className="venn-card">
      <h2>Customer</h2>
      <div style={{marginBottom:'1rem'}}>
        <b>Box code:</b> {code}
      </div>
      <div style={{marginBottom:'1rem'}}>
        <b>Fonctionnalités à venir...</b>
      </div>
    </div>
  );
}
