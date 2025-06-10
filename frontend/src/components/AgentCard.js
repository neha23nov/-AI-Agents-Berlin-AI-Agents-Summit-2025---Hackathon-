import React from "react";

const AgentCard = ({ agent, balance }) => (
  <div style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "10px", margin: "10px" }}>
    <h3>{agent.name} ({agent.role})</h3>
    <p>Address: {agent.address.slice(0, 6)}...{agent.address.slice(-4)}</p>
    <p><strong>Balance:</strong> {balance} tokens</p>
  </div>
);

export default AgentCard;
