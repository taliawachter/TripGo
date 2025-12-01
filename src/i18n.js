import { useState, useEffect } from "react";


export const LANGS = [
  { code: "he", name: "עברית", dir: "rtl", locale: "he-IL" },
  { code: "en", name: "English", dir: "ltr", locale: "en-US" },
 ];

export const STR = {
  he: {
    appTitle: "חפש את היעד לטיול המושלם שלכם..",
    placeholder: "למשל: רומא, פריז, תל אביב",
    search: "חיפוש",
    loading: "טוען נתונים ...",
    error: "שגיאה",
    capital: "בירה",
    currency: "מטבע",
    languages: "שפות",
    localTime: "שעה ביעד",
    currentWeather: "מזג אוויר נוכחי",
    wind: "רוח",
    kph: "קמ״ש",
    attractions: "אטרקציות ביעד",
    loadingAttractions: "טוען אטרקציות…",
    noAttractions: "אין אטרקציות להצגה עדיין.",
    shabbatHeader: "🕯️ זמני הדלקת נרות",
    entryShabbat: "כניסת שבת",
    exitShabbat: "יציאת שבת",
    entryHoliday: "כניסת חג",
    exitHoliday: "צאת חג",
    tz: "אזור זמן",
    noEvent: "אין אירוע קרוב לשבוע הקרוב.",
    builtWith: (y) => `נבנה ב- React + Vite ✨· ${y} · על ידי טליה וכטר`,
    bsd: "בס״ד",
    cityCountrySep: ", ",
    langLabel: "שפה",
    map: "מפה ביעד",
    landingTitle: "איך תרצו לטייל היום?",
    landingSubtitle:"TripGo הוא הבית הדיגיטלי של הטיול הבא שלכם – בניית מסלול חכם, מציאת אטרקציות מושלמות והתאמה אישית לסגנון הטיול שלכם, במקום אחד נוח וברור.",
    landingPlannerBtn: "בניית מסלול",
    landingExplorerBtn: "פרטים על היעד",
    backToLanding: "חזרה לעמוד הראשי",
    mapHintLine1: "גלילה שולטת בדף 🔽",
    mapHintLine2: "לחצי כדי להפעיל את המפה",
  },
  en: {
    appTitle: "Find your perfect trip destination..",
    placeholder: "e.g., Rome, Paris, Tel Aviv",
    search: "Search",
    loading: "Loading data ...",
    error: "Error",
    capital: "Capital",
    currency: "Currency",
    languages: "Languages",
    localTime: "Local time",
    currentWeather: "Current weather",
    wind: "Wind",
    kph: "km/h",
    attractions: "Attractions",
    loadingAttractions: "Loading attractions…",
    noAttractions: "No attractions to show yet.",
    shabbatHeader: "🕯️ Candle Lighting Times",
    entryShabbat: "Candle lighting",
    exitShabbat: "Havdalah",
    entryHoliday: "Holiday begins",
    exitHoliday: "Holiday ends",
    tz: "Time zone",
    noEvent: "No upcoming event this week.",
    builtWith: (y) => `Built with React + Vite ✨· ${y} · by Talia Wachter`,
    bsd: "בס" + "\u05f3" + "ד",
    cityCountrySep: ", ",
    langLabel: "Language",
    map: "Map of destination",
    landingTitle: "How would you like to travel today?",
    landingSubtitle: "TripGo is your digital home for your next trip – smart route planning, discovering the best attractions, and personalizing your travel experience, all in one simple and intuitive place.",
    landingPlannerBtn: "Trip planner",
    landingExplorerBtn: "Destination info",
    backToLanding: "Back to home",
    mapHintLine1: "Scroll moves the page 🔽",
    mapHintLine2: "Click to activate the map",
  },
};


// קודי מז"א מתורגמים (חלקי)
const WX_MAP = {
  he: {
    0: "שמיים נקיים",
    1: "בעיקר בהיר",
    2: "מעונן חלקית",
    3: "מעונן",
    45: "ערפל",
    48: "ערפל כפור",
    51: "טפטוף קל",
    53: "טפטוף בינוני",
    55: "טפטוף חזק",
    61: "גשם קל",
    63: "גשם בינוני",
    65: "גשם חזק",
    80: "ממטרים קלים",
    81: "ממטרים בינוניים",
    82: "ממטרים חזקים",
    95: "סופת רעמים",
  },
  en: {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Light showers",
    81: "Moderate showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  },
};

function getLangConf(code) {
  return LANGS.find((l) => l.code === code) || LANGS[0];
}

export function useI18n() {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "he");
  const conf = getLangConf(lang);
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  function t(key) {
    const pack = STR[lang] || STR.en;
    const val = pack?.[key];
    if (typeof val === "function") return val;
    return val ?? STR.en[key] ?? key;
  }

  function wx(code) {
    const table = WX_MAP[lang] || WX_MAP.en || {};
    return table?.[code] || (code != null ? `Code ${code}` : "—");
  }

  return { lang, setLang, conf, t, wx };
}
