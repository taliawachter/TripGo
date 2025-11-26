import React from "react";

export function AttractionCard({ item }) {
  const mediaBox = {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 8,
  };
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        padding: 12,
      }}
    >
      {item?.media?.type === "video" ? (
        item.media.src.includes("youtube.com") ||
        item.media.src.includes("youtu.be") ? (
          <iframe
            title={item.title}
            src={item.media.src}
            style={{ ...mediaBox, height: 180, border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={item.media.src}
            controls
            style={{ ...mediaBox, height: 180 }}
          />
        )
      ) : item?.media?.src ? (
        <img src={item.media.src} alt={item.title} style={mediaBox} />
      ) : null}

      <div style={{ fontWeight: 700 }}>{item.title}</div>
      {item.description && (
        <div style={{ marginTop: 6 }}>{item.description}</div>
      )}
      {item.priceRange && (
        <div
          style={{
            marginTop: 8,
            color: "#374151",
            fontSize: 14,
          }}
        >
          {item.priceRange}
        </div>
      )}
    </div>
  );
}
