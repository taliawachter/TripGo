
import React from "react";
import { STR } from "../i18n";

export function HomePage({ lang, setScreen }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "70px",
          fontWeight: 900,
          color: "#ffffff",
          textShadow: "0 4px 18px rgba(0,0,0,0.6)",
          marginBottom: 16,
          letterSpacing: "1px",
        }}
      >
        TripGo
      </h1>
      <p
        style={{
          color: "#f1f5f9",
          fontSize: 20,
          marginBottom: 36,
          maxWidth: 600,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {STR[lang]?.landingSubtitle || STR.en.landingSubtitle}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setScreen("planner")}
          style={{
            minWidth: 220,
            padding: "14px 22px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 700,
            background: "rgba(255,255,255,0.14)",
            color: "#ffffff",
            boxShadow: "0 10px 25px rgba(0,0,0,.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          ✈️ {STR[lang]?.landingPlannerBtn || STR.en.landingPlannerBtn}
        </button>

        <button
          type="button"
          onClick={() => setScreen("explorer")}
          style={{
            minWidth: 220,
            padding: "14px 22px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 700,
            background: "rgba(255,255,255,0.14)",
            color: "#ffffff",
            boxShadow: "0 10px 25px rgba(0,0,0,.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          📍 {STR[lang]?.landingExplorerBtn || STR.en.landingExplorerBtn}
        </button>
      </div>
    </div>
  )
}
