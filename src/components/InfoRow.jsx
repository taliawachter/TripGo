import React from "react";

// קומפוננטת שורה להצגת מידע

export function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#f8fafc",
        borderRadius: 12,
        padding: "8px 12px",
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}