import React, { useState } from "react";

const PeplinkSupportAgent = () => {
  const [serial, setSerial] = useState("");
  const [connected, setConnected] = useState(false);
  const [paramValue, setParamValue] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [apiResult, setApiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const endpoints = [
    "login", "logout", "auth.client", "auth.client.token", "auth.token.grant", "auth.token.revoke",
    "cmd.billing.newCycle", "cmd.carrier.scan", "cmd.carrier.select", "cmd.channelPci.lock", "cmd.channelPci.scan",
    "cmd.config.apply", "cmd.config.discard", "cmd.config.restore", "cmd.mesh.discover", "cmd.mesh.discover.result",
    "cmd.mesh.request", "cmd.port.poe.disable", "cmd.port.poe.enable", "cmd.sendUssd", "cmd.sms.get", "cmd.sms.sendMessage",
    "cmd.starlink", "cmd.cellularModule.rescanNetwork", "cmd.cellularModule.reset", "cmd.system.reboot", "cmd.wan.cellular",
    "cmd.wifi.connect", "cmd.wifi.disconnect", "cmd.wifi.forget", "cmd.wifi.result", "cmd.wifi.scan",
    "config.gpio", "config.mesh", "config.speedfusionConnectProtect", "config.ssid.profile", "config.wan.connection", "config.wan.connection.priority",
    "info.firmware", "info.location", "info.time", "status.cellularModule.temperature", "status.client", "status.extap.mesh", "status.extap.mesh.link",
    "status.gpio.input", "status.gpio.output", "status.lan.profile", "status.pepvpn", "status.wan.connection", "status.wan.connection.allowance"
  ];

  const handleConnect = () => {
    setConnected(true);
    setApiResult("");
  };

  // Appel API Peplink
  const handleApiCall = async (method = "GET") => {
    setLoading(true);
    setApiResult("");
    try {
      // Adresse IP ou DNS du routeur à partir du SN (à adapter selon infra)
  const baseUrl = `https://peplink-${serial}:8002/api/${endpoint}`;
      let response;
      if (method === "POST") {
        response = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: paramValue ? JSON.stringify({ value: paramValue }) : "{}",
        });
      } else {
        response = await fetch(baseUrl);
      }
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiResult("Erreur lors de l'appel API: " + err.message);
    }
    setLoading(false);
  };

  const handleSave = () => {
    handleApiCall("POST");
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Agent de Support Peplink</h2>
      <label>Numéro de série du Peplink:</label>
      <input
        type="text"
        value={serial}
        onChange={e => setSerial(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Ex: 123456789"
      />
      <label>Choisir l'endpoint API:</label>
      <select
        value={endpoint}
        onChange={e => setEndpoint(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      >
        <option value="">-- Sélectionner --</option>
        {endpoints.map(ep => (
          <option key={ep} value={ep}>{ep}</option>
        ))}
      </select>
      <button onClick={handleConnect} disabled={!serial || !endpoint} style={{ width: "100%", marginBottom: 16 }}>
        Se connecter
      </button>
      {connected && (
        <button
          onClick={() => handleApiCall("GET")}
          disabled={loading}
          style={{ width: "100%", marginBottom: 8 }}
        >
          Lire l'endpoint
        </button>
      )}
      {connected && (
        <>
          <div style={{ marginBottom: 16 }}>
            <strong>Interface Peplink ouverte sur le port 7777:</strong>
            <iframe
              title="Peplink GUI"
              src={`http://peplink-${serial}:7777`}
              style={{ width: "100%", height: 200, border: "1px solid #888", marginTop: 8 }}
            />
          </div>
          <label>Modifier un paramètre (optionnel):</label>
          <input
            type="text"
            value={paramValue}
            onChange={e => setParamValue(e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
            placeholder="Nouvelle valeur"
          />
          <button onClick={handleSave} style={{ width: "100%" }} disabled={loading}>
            Sauver la modification
          </button>
          <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
            Endpoint sélectionné : <b>{endpoint}</b>
          </div>
          {loading && <div style={{ marginTop: 8, color: '#888' }}>Chargement...</div>}
          {apiResult && (
            <pre style={{ background: '#f6f6f6', padding: 12, marginTop: 12, borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
              {apiResult}
            </pre>
          )}
        </>
      )}
    </div>
  );
};

export default PeplinkSupportAgent;
