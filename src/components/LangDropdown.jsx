import React from "react";
import { LANGS } from "../i18n";


export function LangDropdown({ lang, setLang, isRTL }) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div
      style={{ position: "relative", minWidth: 130 }}
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.7)",
          background: "rgba(0,0,0,0.45)",
          color: "#f9fafb",
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(4px)",
        }}
      >
        <span>{current.name}</span>
        <span style={{ fontSize: 10, marginInlineStart: 6 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            insetInlineStart: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
            backdropFilter: "blur(6px)",
            maxHeight: 220,
            overflowY: "auto",
            minWidth: "100%",
          }}
        >
          {LANGS.map((l) => (
            <div
              key={l.code}
              onMouseEnter={() => setHovered(l.code)}
              onMouseLeave={() => setHovered(null)}
              onMouseDown={(e) => {
                e.preventDefault();
                setLang(l.code);
                setOpen(false);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 14,
                color: "#f9fafb",
                cursor: "pointer",
                textAlign: isRTL ? "right" : "left",
                background:
                  l.code === lang
                    ? "rgba(255,255,255,0.22)"
                    : hovered === l.code
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
                boxShadow:
                  hovered === l.code
                    ? "0 0 0 1px rgba(255,255,255,0.45)"
                    : "none",
                transition:
                  "background 120ms ease, box-shadow 120ms ease",
              }}
            >
              {l.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
