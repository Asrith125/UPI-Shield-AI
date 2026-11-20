
const STORAGE_KEY = "upishield-transactions";

// Parse DD/MM/YYYY or DD-MM-YYYY with time (IST)
function checkTimestamp(value) {
  if (!value) {
    return { status: "unknown" };
  }

  const match = value.match(
    /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!match) {
    return { status: "unknown" };
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]) < 100
    ? 2000 + Number(match[3])
    : Number(match[3]);

  let hour = Number(match[4]);
  const minute = Number(match[5]);
  const ampm = match[6]?.toUpperCase();

  if (ampm) {
    if (hour < 1 || hour > 12) {
      return { status: "invalid" };
    }
    hour = hour % 12 + (ampm === "PM" ? 12 : 0);
  }

  if (
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour > 23 || minute > 59
  ) {
    return { status: "invalid" };
  }

  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute)
    - 330 * 60 * 1000
  );

  // Verify calendar date does not roll over
  const ist = new Date(date.getTime() + 330 * 60 * 1000);

  if (
    ist.getUTCFullYear() !== year ||
    ist.getUTCMonth() + 1 !== month ||
    ist.getUTCDate() !== day
  ) {
    return { status: "invalid" };
  }

  if (date.getTime() > Date.now() + 5 * 60 * 1000) {
    return { status: "future" };
  }

  return { status: "valid" };
}

async function getImageHash(file) {
  const bytes = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function detectFraud(ocrData, file) {
  const start = performance.now();
  const reasons = [];
  const checks = [];

  // Check 1: Timestamp
  const timeResult = checkTimestamp(ocrData.timestamp);

  if (timeResult.status === "invalid") {
    reasons.push("Invalid transaction date or time");
  } else if (timeResult.status === "future") {
    reasons.push("Transaction timestamp is in the future");
  }

  checks.push({
    name: "timestamp",
    status: timeResult.status
  });

  // Check 2: Duplicate transaction ID
  const id = ocrData.transactionId?.trim().toUpperCase();
  const hash = await getImageHash(file);

  let saved = {};
  try {
    saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
  } catch {
    saved = {};
  }

  if (id && saved[id] && saved[id] !== hash) {
    reasons.push(
      "Same transaction ID found in a different image"
    );
    checks.push({
      name: "duplicate_id",
      status: "flagged"
    });
  } else {
    checks.push({
      name: "duplicate_id",
      status: id ? "not_flagged" : "not_checked"
    });
  }

  if (id && !saved[id]) {
    saved[id] = hash;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  const suspicious = reasons.length > 0;

  if (!suspicious) {
    reasons.push(
      "Basic checks found no anomaly; image forensics pending"
    );
  }

  return {
    verdict: suspicious ? "Suspicious" : "Inconclusive",
    reasons,
    checks,
    processingMs: Math.round(performance.now() - start)
  };
}
