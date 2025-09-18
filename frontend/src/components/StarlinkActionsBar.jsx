import React from "react";

const StarlinkActionsBar = ({ onAuth, onGetToken, onGetTelemetry, onGetHistory, onGetAccount, onRefresh, onTestApi }) => (
  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
    <button onClick={onAuth}>Authentification OAuth2</button>
    <button onClick={onGetToken}>Récupérer un token</button>
    <button onClick={onGetTelemetry}>Télémétrie en direct</button>
    <button onClick={onGetHistory}>Historique télémétrie</button>
    <button onClick={onGetAccount}>Infos compte Starlink</button>
    <button onClick={onRefresh}>Rafraîchir les données</button>
    <button onClick={onTestApi}>Tester connexion API</button>
  </div>
);

export default StarlinkActionsBar;
