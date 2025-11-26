import React from "react";


export function DestinationClock({ timeZone, locale = "en-US" }) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone,
  }).format(now);
}
