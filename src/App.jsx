import React, { useState, useEffect } from "react";
import { useI18n, STR } from "./i18n";
import { LangDropdown } from "./components/LangDropdown";
import { HomePage } from "./pages/HomePage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { PlannerPage } from "./pages/PlannerPage";

export default function App() {
  const { lang, setLang, conf, t, wx } = useI18n();
  const [screen, setScreen] = useState("landing"); // landing | explorer | planner
  const isRTL = conf.dir === "rtl";

  const images = [
    "https://picsum.photos/id/29/1600/900",
    "https://picsum.photos/id/43/1600/900",
    "https://picsum.photos/id/234/1600/900",
    "https://picsum.photos/id/283/1600/900",
    "https://picsum.photos/id/381/1600/900",
    "https://picsum.photos/id/392/1600/900",
    "https://picsum.photos/id/420/1600/900",
    "https://picsum.photos/id/629/1600/900",
    "https://picsum.photos/id/791/1600/900",
    "https://picsum.photos/id/1067/1600/900",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        fontFamily: "Heebo, system-ui, Arial",
        margin: 0,
        minHeight: "100vh",
        background: "#000",
        color: "#1f2937",
      }}
    >
      {/* שורת בחר שפה + בס"ד */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: "auto",
          left: 14,
          display: "flex",
          gap: 8,
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "#f9fafb",
            textShadow: "0 0 4px rgba(0,0,0,0.7)",
          }}
        >
          {STR[lang]?.langLabel || STR.en.langLabel}
        </span>
        <LangDropdown lang={lang} setLang={setLang} isRTL={isRTL} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 10,
          left: "auto",
          right: 14,
          fontSize: 18,
          fontWeight: 600,
          color: "#ffffffff",
          textShadow: "0 0 6px rgba(0,0,0,0.6)",
          zIndex: 1000,
        }}
      >
        {STR[lang]?.bsd || STR.en.bsd}
      </div>

      {/* HERO כרקע מלא */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === currentIndex ? 1 : 0,
              transition: "opacity 900ms ease-in-out",
              willChange: "opacity",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        ))}

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.45) 70%)",
          }}
        />

        {/* דפים שונים */}
        {screen === "landing" && (
          <HomePage lang={lang} setScreen={setScreen} />
        )}

        {screen === "planner" && (
          <PlannerPage lang={lang} onBack={() => setScreen("landing")} />
        )}

        {screen === "explorer" && (
          <ExplorerPage
            lang={lang}
            conf={conf}
            wx={wx}
            onBack={() => setScreen("landing")}
          />
        )}
      </section>
{/* 
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "14px",
          color: "#e5e7eb",
          background: "#0b0b0b",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      > */}
        {/* {(STR[lang]?.builtWith || STR.en.builtWith)(
          new Date().getFullYear()
        )} */}
      {/* </footer> */}
    </div>
  );
}
