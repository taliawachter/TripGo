import React from "react";
import { AttractionCard } from "./AttractionCard";
import { STR } from "../i18n";

export function AttractionsSection({ items, loading, error, t }) {
  const dict = t || STR.en;
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>
        {dict.attractions || STR.en.attractions}
      </h3>
      {loading && (
        <div style={{ color: "#6b7280" }}>
          {dict.loadingAttractions || STR.en.loadingAttractions}
        </div>
      )}
      {error && (
        <div style={{ color: "#b91c1c", fontWeight: 600 }}>
          {STR.en.error + ": "}
          {error}
        </div>
      )}
      {!loading && !error && (!items || items.length === 0) && (
        <div style={{ color: "#6b7280" }}>
          {dict.noAttractions || STR.en.noAttractions}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
        }}
      >
        {items?.map((item) => (
          <AttractionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
