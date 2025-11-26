import React, { useState } from "react";
import { STR } from "../i18n";

export function PlannerPage({ lang, onBack }) {
  const [travelersType, setTravelersType] = useState("couple");
  const [travelersCount, setTravelersCount] = useState(2);
  const [nights, setNights] = useState(5);
  const [month, setMonth] = useState("");
  const [budgetLevel, setBudgetLevel] = useState("medium");
  const [style, setStyle] = useState([]); // array: ['beach','shopping',...]
  const [needKosher, setNeedKosher] = useState(true);
  const [nearChabad, setNearChabad] = useState(false);
  const [directFlightsOnly, setDirectFlightsOnly] = useState(true);
  const [departureAirport, setDepartureAirport] = useState("TLV");
  const [notes, setNotes] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [preferredDestination, setPreferredDestination] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [error, setError] = useState("");

  const isHeb = lang === "he";

  function toggleStyle(value) {
    setStyle((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  const baseFieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 14px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
    color: "#0f172a",
    fontSize: 14,
    outline: "none",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const textareaStyle = {
    ...baseFieldStyle,
    borderRadius: 16,
    minHeight: 70,
    resize: "vertical",
    fontSize: 13,
  };

  function pillStyle(active, color = "#0ea5e9") {
    return {
      padding: "7px 12px",
      borderRadius: 999,
      border: active
        ? `1px solid ${color}`
        : "1px solid rgba(148,163,184,0.7)",
      background: active
        ? "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(56,189,248,0.9))"
        : "rgba(255,255,255,0.78)",
      color: active ? "#ffffff" : "#0f172a",
      fontSize: 13,
      cursor: "pointer",
      boxShadow: active
        ? "0 8px 22px rgba(37,99,235,0.45)"
        : "0 2px 6px rgba(15,23,42,0.18)",
      transition: "all 140ms ease-out",
    };
  }

  async function handleGenerate() {
    setError("");
    setAiResult("");
    setLoading(true);

    const tripRequest = {
      travelersType,
      travelersCount: Number(travelersCount) || 1,
      nights: Number(nights) || 1,
      month: month || null,
      budgetLevel,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      style,
      needKosher,
      nearChabad,
      directFlightsOnly,
      departureAirport,
      preferredDestination: preferredDestination?.trim() || null,
      notes: notes?.trim() || null,
      language: lang,
    };

    try {
      const res = await fetch("http://localhost:3001/api/trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripRequest }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data);
        throw new Error(data.error || data.details || "Server error");
      }

      setAiResult(
        data.planText ||
          (isHeb
            ? "לא התקבלה תשובה מה-AI. נסי שוב מאוחר יותר."
            : "No response text from AI. Please try again.")
      );
    } catch (e) {
      console.error(e);
      setError(
        isHeb
          ? "אירעה שגיאה בעת יצירת המסלול. נסי שוב מאוחר יותר."
          : "An error occurred while generating the plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* CSS פנימי – במקום קובץ נפרד */}
      <style>
        {`
        .planner-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.1fr);
          gap: 22px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .planner-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}
      </style>

      <div
        style={{
          position: "relative",
          margin: "80px auto 40px",
          width: "min(96vw, 1150px)",
          background:
            "linear-gradient(60deg, rgba(240, 240, 240, 0.93), rgba(248,250,252,0.72))",
          boxShadow: "0 20px 55px rgba(223, 216, 216, 0.45)",
          borderRadius: 26,
          border: "1px solid rgba(231, 228, 228, 0.65)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          padding: 26,
          overflow: "visible",
        }}
      >
        {/* חץ חזרה */}
        <div
          onClick={onBack}
          style={{
            position: "absolute",
            top: 7,
            insetInlineStart: 18,
            cursor: "pointer",
            fontSize: 26,
            color: "#000000",
            userSelect: "none",
          }}
        >
          {lang === "he" ? "→" : "←"}
        </div>

        <h1
          style={{
            margin: "0 0 4px",
            textAlign: "center",
            color: "#0f172a",
            fontSize: 30,
            letterSpacing: "0.03em",
          }}
        >
          {STR[lang]?.landingPlannerBtn || STR.en.landingPlannerBtn}
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
            margin: "0 0 24px",
          }}
        >
          {isHeb
            ? "עני על כמה שאלות קצרות, ונבנה עבורך מסלול ראשוני ✈️"
            : "Answer a few quick questions and we'll build an AI-based first draft for your trip ✈️"}
        </p>

        {/* GRID – טופס + תוצאת AI */}
        <div className="planner-layout">
          {/* טופס */}
          <div>
            {/* סוג נוסעים */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb ? "מי נוסע?" : "Who is traveling?"}
              </label>
              <select
                value={travelersType}
                onChange={(e) => setTravelersType(e.target.value)}
                style={baseFieldStyle}
              >
                <option value="couple">
                  {isHeb ? "זוג " : "Couple / honeymoon"}
                </option>
                <option value="family">
                  {isHeb ? "משפחה" : "Family"}
                </option>
                <option value="friends">
                  {isHeb ? "חברים" : "Friends"}
                </option>
                <option value="solo">
                  {isHeb ? "טיול סולו" : "Solo trip"}
                </option>
              </select>
            </div>

            {/* כמות נוסעים + מספר לילות */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label
                  style={{ display: "block", fontSize: 14, marginBottom: 4 }}
                >
                  {isHeb ? "כמה נוסעים?" : "How many travelers?"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(e.target.value)}
                  style={baseFieldStyle}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", fontSize: 14, marginBottom: 4 }}
                >
                  {isHeb ? "מספר לילות" : "Number of nights"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  style={baseFieldStyle}
                />
              </div>
            </div>

            {/* יעד מועדף */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb
                  ? "יעד מועדף (לא חובה)"
                  : "Preferred destination (optional)"}
              </label>
              <input
                type="text"
                value={preferredDestination}
                onChange={(e) => setPreferredDestination(e.target.value)}
                style={baseFieldStyle}
                placeholder={
                  isHeb
                    ? "למשל: זנזיבר, רומא, לונדון..."
                    : "e.g. Zanzibar, Rome, London..."
                }
              />
            </div>

            {/* חודש / עונה */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb ? "באיזה חודש / עונה ?" : "In which month/season?"}
              </label>
              <input
                type="text"
                placeholder={
                  isHeb
                    ? "למשל: יולי, דצמבר, פסח"
                    : "e.g. July, December, summer"
                }
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={baseFieldStyle}
              />
            </div>

            {/* תקציב */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb ? "רמת תקציב" : "Budget level"}
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { id: "low", labelHe: "חסכוני", labelEn: "Low / budget" },
                  { id: "medium", labelHe: "בינוני", labelEn: "Medium" },
                  {
                    id: "high",
                    labelHe: "מפנק / יוקרתי",
                    labelEn: "High / luxury",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBudgetLevel(opt.id)}
                    style={
                      budgetLevel === opt.id
                        ? pillStyle(true, "#3d99b3")
                        : pillStyle(false)
                    }
                  >
                    {isHeb ? opt.labelHe : opt.labelEn}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 4 }}
                >
                  {isHeb
                    ? "תקציב משוער (לכל הטיול - בדולר)"
                    : "Approximate budget (for the whole trip)"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  style={baseFieldStyle}
                  placeholder={isHeb ? "למשל: 8000" : "e.g. 2000"}
                />
              </div>
            </div>

            {/* סגנון טיול */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb ? "מה סגנון הטיול?" : "Trip style"}
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                {(() => {
                  const baseStyles = [
                    { id: "city", he: "עירוני", en: "City" },
                    { id: "beach", he: "בטן גב", en: "Beach" },
                    { id: "shopping", he: "שופינג", en: "Shopping" },
                    { id: "nature", he: "טבע ונופים", en: "Nature" },
                    { id: "nightlife", he: "חיי לילה", en: "Nightlife" },
                    { id: "casino", he: "קזינו", en: "casino" },
                  ];

                  if (travelersType === "couple") {
                    baseStyles.push(
                      {
                        id: "honeymoon",
                        he: "ירח דבש",
                        en: "Honeymoon",
                      },
                      {
                        id: "babymoon",
                        he: "בייבי-מון",
                        en: "Babymoon",
                      }
                    );
                  }

                  if (travelersType === "family") {
                    baseStyles.push({
                      id: "kids",
                      he: "אטרקציות לילדים",
                      en: "  להכניס תרגום אנגלית ",
                    });
                  }

                  return baseStyles;
                })().map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleStyle(opt.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: style.includes(opt.id)
                        ? "2px solid #d1d5db"
                        : "1px solid #d1d5db",
                      background: style.includes(opt.id)
                        ? "#3d99b3ff"
                        : "rgba(71,65,65,0.8)",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {isHeb ? opt.he : opt.en}
                  </button>
                ))}
              </div>
            </div>

            {/* כשרות וטיסות */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label
                  style={{ display: "block", fontSize: 14, marginBottom: 4 }}
                >
                  {isHeb ? "צרכי כשרות" : "Kosher / religious needs"}
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <label style={{ fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={needKosher}
                      onChange={(e) => setNeedKosher(e.target.checked)}
                      style={{ marginInlineEnd: 6 }}
                    />
                    {isHeb ? "חשוב לי אוכל כשר" : "I need kosher options"}
                  </label>
                  <label style={{ fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={nearChabad}
                      onChange={(e) => setNearChabad(e.target.checked)}
                      style={{ marginInlineEnd: 6 }}
                    />
                    {isHeb
                      ? 'עדיפות קרוב לבית חב"ד / בית כנסת'
                      : "Prefer near Chabad / synagogue"}
                  </label>
                </div>
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 14, marginBottom: 4 }}
                >
                  {isHeb ? "טיסות" : "Flights"}
                </label>
                <label
                  style={{
                    fontSize: 13,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={directFlightsOnly}
                    onChange={(e) => setDirectFlightsOnly(e.target.checked)}
                    style={{ marginInlineEnd: 6 }}
                  />
                  {isHeb ? "רק טיסות ישירות" : "Only direct flights"}
                </label>
                <input
                  type="text"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value)}
                  style={baseFieldStyle}
                  placeholder={
                    isHeb
                      ? "שדה יציאה (למשל: TLV)"
                      : "Departure airport (e.g. TLV)"
                  }
                />
              </div>
            </div>

            {/* הערות חופשיות */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 14, marginBottom: 4 }}
              >
                {isHeb ? "הערות נוספות (לא חובה)" : "Extra notes (optional)"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={textareaStyle}
                placeholder={
                  isHeb
                    ? "למשל: טיול הפתעה לבן/בת זוג, נוסעת עם ילדים קטנים, רוצה יום שופינג אחד לפחות..."
                    : "e.g. surprise trip, traveling with small kids, must include at least one shopping day..."
                }
              />
            </div>

            {/* כפתור יצירת מסלול */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                cursor: loading ? "default" : "pointer",
                background: loading ? "#3d99b3ff" : "rgba(71,65,65,0.8)",
                boxShadow: "0 10px 25px rgba(71,65,65,0.8)",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {loading
                ? isHeb
                  ? "בונה עבורך מסלול..."
                  : "Generating your plan..."
                : isHeb
                ? "בנה לי מסלול"
                : "Generate trip plan with AI"}
            </button>

            {error && (
              <p
                style={{
                  marginTop: 10,
                  color: "#b91c1c",
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* תוצאה מה-AI */}
          <div
            style={{
              borderRadius: 20,
              border: "1px solid rgba(148,163,184,0.3)",
              padding: 18,
              fontSize: 16,
              color: "#191a1bff",
              whiteSpace: "pre-wrap",
              maxHeight: "700px",
              overflowY: "auto",
            }}
          >
            {!aiResult && !loading && (
              <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                {isHeb
                  ? "כאן יופיע המסלול המוצע, אחרי שתלחצי על הכפתור."
                  : "Your AI-based itinerary will appear here after you click the button."}
              </p>
            )}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: "20px 0",
                }}
              >
                <img
                  src="/src/assets/plane-loading.gif"
                  alt="Loading plane"
                  style={{
                    width: "150px",
                    marginBottom: "10px",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    color: "#3b82f6",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {isHeb
                    ? "בונים עבורך את המסלול המושלם..."
                    : "Building your perfect trip..."}
                </p>
              </div>
            )}

            {aiResult && !loading && <div>{aiResult}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
