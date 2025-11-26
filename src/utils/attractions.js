
import {STR} from "../i18n";

export async function loadAttractionsFor(countryCode, lang) {
  const supported = ["he", "en", "fr", "ru", "es"];
  const langCode = supported.includes(lang) ? lang : "en";

  const url = `/attractions_${langCode}.json`;

  let body = "";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    body = await res.text();
    if (!body.trim()) return [];

    const json = JSON.parse(body);
    const all = Array.isArray(json) ? json : json.items || [];

    const codeL = (countryCode || "").toLowerCase();

    return all.filter(
      (a) => (a.countryCode || "").toLowerCase() === codeL
    );
  } catch (err) {
    console.warn(
      "attractions fetch/parse error:",
      err.message,
      "preview:",
      body.slice(0, 120)
    );
    return [];
  }
}
