const timeEl = document.getElementById("local-time");
const tzLabel = document.getElementById("tz-label");

if (timeEl) {
  const tz = "America/Chicago";
  let blinkOn = true;

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const tzShort = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "CT";

  if (tzLabel) tzLabel.textContent = tzShort;

  const tickClock = () => {
    const parts = fmt.formatToParts(new Date());
    const h = parts.find((p) => p.type === "hour")?.value ?? "--";
    const m = parts.find((p) => p.type === "minute")?.value ?? "--";
    const s = parts.find((p) => p.type === "second")?.value ?? "--";
    const sep = blinkOn ? ":" : '<span style="opacity:0.25">:</span>';
    timeEl.innerHTML = `${h}<span class="blink">${sep}</span>${m}<span class="blink">${sep}</span>${s}`;
    blinkOn = !blinkOn;
  };

  tickClock();
  setInterval(tickClock, 1000);
}
