import React, { useState, useEffect } from "react";
import { STR } from "../i18n";
import { buildOsmMapUrl } from "../utils/maps";
import { loadAttractionsFor } from "../utils/attractions";
import { InfoRow } from "../components/InfoRow";
import { DestinationClock } from "../components/DestinationClock";
import { AttractionsSection } from "../components/AttractionsSection";

const HAVDALAH_MINUTES = 50;

export function ExplorerPage({ lang, conf, wx, onBack }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [mapActive, setMapActive] = useState(false);
const [suggestEnabled, setSuggestEnabled] = useState(true);

  const [attractions, setAttractions] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);
  const [attrErr, setAttrErr] = useState(null);

  const [jEvent, setJEvent] = useState(null);
  const [jLoading, setJLoading] = useState(false);
  const [jErr, setJErr] = useState(null);

  const isRTL = conf.dir === "rtl";

  async function handleSearch(e, forcedQuery) {
    e?.preventDefault();
    const cityQuery = (forcedQuery ?? q).trim();
    if (!cityQuery) return;

    setLoading(true);
    setErr(null);
    setData(null);
    setSuggestions([]);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityQuery
        )}&count=1&language=${encodeURIComponent(lang)}&format=json`
      );
      if (!geoRes.ok) throw new Error("GEOCODING_FAILED");
      const geo = await geoRes.json();
      if (!geo.results || geo.results.length === 0)
        throw new Error("CITY_NOT_FOUND");

      const g = geo.results[0];
      const city = g.name;
      const country = g.country;
      const countryCode = (g.country_code || "").toLowerCase();
      const lat = g.latitude;
      const lon = g.longitude;

      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      );
      if (!wxRes.ok) throw new Error("WEATHER_FAILED");
      const wxJson = await wxRes.json();
      const tempC = wxJson?.current_weather?.temperature ?? null;
      const weatherCode = wxJson?.current_weather?.weathercode ?? null;
      const wind = wxJson?.current_weather?.windspeed ?? null;
      const timezone = wxJson?.timezone ?? null;

      let capital = null,
        currency = null,
        currencySymbol = null,
        languages = [],
        flagPng = null;

      if (countryCode) {
        const cRes = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryCode}`
        );
        if (cRes.ok) {
          const cJson = await cRes.json();
          const c = Array.isArray(cJson) ? cJson[0] : cJson;
          capital = c?.capital?.[0] || null;
          if (c?.currencies) {
            const code = Object.keys(c.currencies)[0];
            const obj = c.currencies[code];
            currency = `${code} — ${obj?.name || "Currency"}`;
            currencySymbol = obj?.symbol || null;
          }
          if (c?.languages) languages = Object.values(c.languages);
          flagPng = c?.flags?.png || null;
        }
      }

      setData({
        city,
        country,
        capital,
        currency,
        currencySymbol,
        languages,
        flagPng,
        lat,
        lon,
        tempC,
        weatherCode,
        wind,
        timezone,
        countryCode,
      });
    } catch (e2) {
      const msg = String(e2?.message || e2);
      let human;
      if (msg === "CITY_NOT_FOUND")
        human =
          lang === "he"
            ? "העיר לא נמצאה - נסו חיפוש באנגלית"
            : "City not found - try English name";
      else if (msg === "GEOCODING_FAILED")
        human = lang === "he" ? "כשל בגיאוקודינג" : "Geocoding failed";
      else if (msg === "WEATHER_FAILED")
        human =
          lang === "he" ? "כשל בשליפת מזג אוויר" : "Failed to fetch weather";
      else human = lang === "he" ? "שגיאה לא ידועה" : "Unknown error";
      setErr(human);
    } finally {
      setLoading(false);
    }
  }

  // אוטוקומפליט
  useEffect(() => {
    const term = q.trim();
    if (!term|| !suggestEnabled) {
      setSuggestions([]);
      return;
    }

    const delayId = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            term
          )}&count=6&language=${encodeURIComponent(lang)}&format=json`
        );
        if (!res.ok) throw new Error("SUGGEST_FAILED");
        const json = await res.json();
        if (!json.results || !json.results.length) {
          setSuggestions([]);
          return;
        }
        const mapped = json.results.map((r) => ({
          id: `${r.id}-${r.latitude}-${r.longitude}`,
          name: r.name,
          country: r.country,
          countryCode: (r.country_code || "").toLowerCase(),
          admin1: r.admin1 || null,
          lat: r.latitude,
          lon: r.longitude,
          query: r.name,
        }));
        setSuggestions(mapped);
      } catch (e) {
        console.warn("suggest error", e);
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 350);

    return () => clearTimeout(delayId);
  }, [q, lang, suggestEnabled]);

  useEffect(() => {
    setMapActive(false);
  }, [data?.lat, data?.lon]);

  // אטרקציות
  useEffect(() => {
    if (!data?.countryCode) return;
    setAttrLoading(true);
    setAttrErr(null);
    loadAttractionsFor(data.countryCode, lang)
      .then(setAttractions)
      .catch((e) => setAttrErr(e.message || "ATTR_FAILED"))
      .finally(() => setAttrLoading(false));
  }, [data?.countryCode, lang]);

  // זמנים יהודיים
  function fmtLocal(iso, tzid) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString(conf.locale || "en-US", {
        timeZone: tzid,
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  async function getShabbatTimesByCoords({ lat, lon, tzid }) {
    if (lat == null || lon == null) throw new Error("MISSING_COORDS");
    const tz = tzid || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const url = new URL("https://www.hebcal.com/shabbat");
    url.searchParams.set("cfg", "json");
    url.searchParams.set("geo", "pos");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("tzid", tz);
    url.searchParams.set("M", "on");
    url.searchParams.set("m", String(HAVDALAH_MINUTES));
    url.searchParams.set("b", "18");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`SHABBAT_HTTP_${res.status}${text ? " - " + text : ""}`);
    }
    const dataJson = await res.json();
    const items = Array.isArray(dataJson.items) ? dataJson.items : [];

    const nowStr = new Date().toLocaleString("en-US", { timeZone: tz });
    const now = new Date(nowStr);

    const candlesList = items
      .filter((i) => i.category === "candles")
      .map((i) => ({ ...i, d: new Date(i.date) }))
      .filter((i) => i.d >= now)
      .sort((a, b) => a.d - b.d);

    const nextCandles = candlesList[0] || null;
    if (!nextCandles) {
      return {
        eventType: null,
        eventName: null,
        candles: null,
        havdalah: null,
        tz,
      };
    }

    const holidays = items
      .filter((i) => i.category === "holiday")
      .map((h) => ({ ...h, d: new Date(h.date) }));
    const parashot = items
      .filter((i) => i.category === "parashat")
      .map((p) => ({ ...p, d: new Date(p.date) }));

    const holidayHit = holidays.find(
      (h) => Math.abs(h.d - nextCandles.d) <= 36 * 3600 * 1000
    );

    let parashaHit = null;
    if (!holidayHit) {
      parashaHit =
        parashot
          .filter((p) => p.d >= nextCandles.d)
          .sort((a, b) => a.d - b.d)
          .find((p) => p.d - nextCandles.d <= 60 * 3600 * 1000) || null;
    }

    let eventType = "shabbat";
    let eventName = lang === "he" ? "שבת" : "Shabbat";
    if (holidayHit) {
      eventType = "holiday";
      eventName =
        holidayHit.hebrew ||
        holidayHit.title ||
        (lang === "he" ? "חג" : "Holiday");
    } else if (parashaHit) {
      const p = parashaHit.hebrew || parashaHit.title || "";
      eventName = lang === "he" ? `שבת – ${p}` : `Shabbat – ${p}`;
    }

    const havdalah =
      items
        .filter((i) => i.category === "havdalah")
        .map((i) => ({ ...i, d: new Date(i.date) }))
        .filter(
          (i) =>
            i.d >= nextCandles.d && i.d - nextCandles.d <= 96 * 3600 * 1000
        )
        .sort((a, b) => a.d - b.d)[0] || null;

    return { eventType, eventName, candles: nextCandles, havdalah, tz };
  }

  useEffect(() => {
    if (!data?.lat || !data?.lon) {
      setJEvent(null);
      return;
    }
    setJLoading(true);
    setJErr(null);
    getShabbatTimesByCoords({
      lat: data.lat,
      lon: data.lon,
      tzid: data.timezone,
    })
      .then(setJEvent)
      .catch((e) => setJErr(e.message || "SHABBAT_FAILED"))
      .finally(() => setJLoading(false));
  }, [data?.lat, data?.lon, data?.timezone, lang]);

  return (
    <div
      style={{
        position: "relative",
        margin: "80px auto 40px",
        width: "min(96vw, 1100px)",
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 12px 40px rgba(0,0,0,.25)",
        borderRadius: 18,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: 24,
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
        {isRTL ? "→" : "←"}
      </div>

      <h1
        style={{
          margin: "0 0 12px",
          textAlign: "center",
          color: "#0f172a",
          fontSize: 26,
        }}
      >
        {STR[lang]?.appTitle || STR.en.appTitle}
      </h1>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(520px, 100%)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              value={q}
              onChange={(e) =>{ setQ(e.target.value);
                  setSuggestEnabled(true);
              }}
              placeholder={STR[lang]?.placeholder || STR.en.placeholder}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgb(100,104,117)",
                outline: "none",
                background: "#fff",
                color: "#111827",
                fontSize: 16,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {STR[lang]?.search || STR.en.search}
            </button>
          </div>

          {(suggestions.length > 0 || suggestLoading) && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                insetInlineStart: 0,
                marginTop: 4,
                background: "rgba(255,255,255,0.96)",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,.25)",
                overflow: "hidden",
                zIndex: 500,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {suggestLoading && (
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: 14,
                    color: "#6b7280",
                  }}
                >
                  {STR[lang]?.loading || STR.en.loading}
                </div>
              )}

              {!suggestLoading &&
                suggestions.map((s) => (
                  <div
                    key={s.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSuggestEnabled(false);
                      setQ(s.query);
                      handleSearch(null, s.query);
                      setSuggestions([]);
                    }}
                    style={{
                      padding: "8px 12px",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      background: "#fff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(15,23,42,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {s.name}
                      {s.country ? `, ${s.country}` : ""}
                    </span>
                    {s.admin1 && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {s.admin1}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </form>

      {loading && (
        <div
          style={{
            color: "#374151",
            textAlign: "center",
            padding: "6px 0 2px",
          }}
        >
          {STR[lang]?.loading || STR.en.loading}
        </div>
      )}
      {err && (
        <div
          style={{
            color: "#b91c1c",
            marginTop: 8,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {(STR[lang]?.error || STR.en.error) + ": "}
          {String(err)}
        </div>
      )}

      {data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 16,
            }}
          >
            {/* פרטי יעד */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {data.flagPng && (
                  <img
                    src={data.flagPng}
                    alt="flag"
                    style={{
                      width: 28,
                      height: 18,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                )}
                <h2 style={{ margin: 0, fontSize: 20 }}>
                  {data.city}
                  {STR[lang]?.cityCountrySep || STR.en.cityCountrySep}
                  {data.country}
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <InfoRow
                  label={STR[lang]?.capital || STR.en.capital}
                  value={data.capital || "—"}
                />
                <InfoRow
                  label={STR[lang]?.currency || STR.en.currency}
                  value={
                    data.currency
                      ? `${data.currency}${
                          data.currencySymbol ? ` (${data.currencySymbol})` : ""
                        }`
                      : "—"
                  }
                />
                <InfoRow
                  label={STR[lang]?.languages || STR.en.languages}
                  value={
                    data.languages?.length
                      ? data.languages.join(", ")
                      : "—"
                  }
                />
                <InfoRow
                  label={STR[lang]?.localTime || STR.en.localTime}
                  value={
                    data.timezone ? (
                      <DestinationClock
                        timeZone={data.timezone}
                        locale={conf.locale || "en-US"}
                      />
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            </div>

            {/* מזג אוויר */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                padding: 14,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: 18 }}>
                {STR[lang]?.currentWeather || STR.en.currentWeather}
              </h3>
              <div style={{ fontSize: 34, fontWeight: 700 }}>
                {data.tempC ?? "—"}°C
              </div>
              <div style={{ color: "#6b7280" }}>
                {data.weatherCode != null ? wx(data.weatherCode) : "—"}
              </div>
              <div style={{ color: "#6b7280" }}>
                {STR[lang]?.wind || STR.en.wind}: {data.wind ?? "—"}{" "}
                {STR[lang]?.kph || STR.en.kph}
              </div>
            </div>
          </div>

          {/* אירוע יהודי קרוב */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 4px 16px rgba(0,0,0,.08)",
              padding: 14,
              marginTop: 12,
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: 18 }}>
              {jEvent?.eventName
                ? `${STR[lang]?.shabbatHeader || STR.en.shabbatHeader}: ${
                    jEvent.eventName
                  }`
                : STR[lang]?.shabbatHeader || STR.en.shabbatHeader}
            </h3>

            {jLoading && (
              <div style={{ color: "#6b7280" }}>
                {STR[lang]?.loading || STR.en.loading}
              </div>
            )}
            {jErr && (
              <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                {(STR[lang]?.error || STR.en.error) + ": "}
                {jErr}
              </div>
            )}

            {!jLoading &&
              !jErr &&
              jEvent &&
              (jEvent.candles || jEvent.havdalah) &&
              (() => {
                const entryLabel =
                  jEvent.eventType === "holiday"
                    ? STR[lang]?.entryHoliday || STR.en.entryHoliday
                    : STR[lang]?.entryShabbat || STR.en.entryShabbat;
                const exitLabel =
                  jEvent.eventType === "holiday"
                    ? STR[lang]?.exitHoliday || STR.en.exitHoliday
                    : STR[lang]?.exitShabbat || STR.en.exitShabbat;
                return (
                  <>
                    <div style={{ display: "grid", gap: 8 }}>
                      <InfoRow
                        label={entryLabel}
                        value={fmtLocal(jEvent.candles?.date, jEvent.tz)}
                      />
                      <InfoRow
                        label={exitLabel}
                        value={fmtLocal(jEvent.havdalah?.date, jEvent.tz)}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 6,
                        textAlign: isRTL ? "left" : "right",
                      }}
                    >
                      {(STR[lang]?.tz || STR.en.tz) + ": "}
                      {jEvent.tz}
                    </div>
                  </>
                );
              })()}

            {!jLoading && !jErr && jEvent && !jEvent.candles && (
              <div style={{ color: "#6b7280" }}>
                {STR[lang]?.noEvent || STR.en.noEvent}
              </div>
            )}
          </div>

          {/* מפה */}
          {data.lat != null && data.lon != null && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                padding: 14,
                marginTop: 12,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: 18 }}>
                {STR[lang]?.map || STR.en.map}
              </h3>
              <div
                onMouseLeave={() => setMapActive(false)}
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  height: 260,
                  border: "1px solid #e5e7eb",
                }}
              >
                <iframe
                  title="Destination map"
                  src={buildOsmMapUrl(data.lat, data.lon)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    pointerEvents: mapActive ? "auto" : "none",
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {!mapActive && (
                  <div
                    onClick={() => setMapActive(true)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(15,23,42,0.28)",
                      color: "#f9fafb",
                      fontSize: 14,
                      cursor: "pointer",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {STR[lang]?.mapHintLine1 || STR.en.mapHintLine1}
                    <br />
                    {STR[lang]?.mapHintLine2 || STR.en.mapHintLine2}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {data &&
        (attrLoading || (attractions && attractions.length > 0)) && (
          <AttractionsSection
            items={attractions}
            loading={attrLoading}
            error={attrErr}
            t={STR[lang] || STR.en}
          />
        )}
    </div>
  );
}
