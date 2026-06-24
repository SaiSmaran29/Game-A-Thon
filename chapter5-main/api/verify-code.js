function normalizeCode(value) {
  return String(value || "").trim().toLowerCase();
}

function getExpectedCodes() {
  return {
    forensic:    normalizeCode(process.env.RV_CODE_SCOUT),
    instagram:   normalizeCode(process.env.RV_CODE_HEALER),
    alliance:    normalizeCode(process.env.RV_CODE_ALLIANCE),
    herosmemoir: normalizeCode(process.env.RV_CODE_HEROSMEMOIR),
  };
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const recordKey = normalizeCode(body.recordKey);
    const answer = normalizeCode(body.answer);
    const expectedCodes = getExpectedCodes();

    if (!recordKey || !(recordKey in expectedCodes)) {
      res.status(400).json({ ok: false, error: "Invalid record key" });
      return;
    }
    const expected = expectedCodes[recordKey];
    if (!expected) {
      res.status(500).json({ ok: false, error: "Server code not configured" });
      return;
    }
    const isCorrect = answer === expected;
    res.status(200).json({ ok: true, isCorrect });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Verification failed" });
  }
};