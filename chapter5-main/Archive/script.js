/* ═══════════════════════════════════════════════
   DETECTIVE DESK  |  script.js
   Shared vanilla-JS logic for the static archive
   ═══════════════════════════════════════════════ */

console.log("%cDetective Desk Archive", "color:#c9963b;font-size:16px;font-weight:bold;");
console.log("The report was never wrong about the weapon.");
console.log("It was wrong about the hour.");
console.log("And that hour was the only thing protecting her.");
console.log("%cFinal Report opens only after all three log codes are entered correctly.", "color:#888;font-style:italic;");

// ── Utility: URL parameter parser ────────────────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ── Page transition (fade-in on load) ────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("page-ready");
  initParticles();
  initRecordCodes();
  initVault();
  initHintToggle();
  markVisitedCards();
});

// ── Ambient particles ─────────────────────────────────────────────────────
function initParticles() {
  const container = document.querySelector(".particles");
  if (!container) return;
}

// ── Record code logic ────────────────────────────────────────────────────

const RECORD_KEYS = ["forensic", "instagram", "alliance", "herosMemoir"];

// Google Form link shown once a log's code is verified.
// Paste each form URL between the quotes; leave "" to hide the link for that log.
const RECORD_FORM_LINKS = {
  forensic:    "https://docs.google.com/forms/d/e/1FAIpQLSfsXo2vgXZttnMXD75r0XoeOE-vydjrsnPk0_ly15w7cZ1OxQ/viewform?usp=sharing&ouid=115715606325516633822",
  instagram:   "https://docs.google.com/forms/d/e/1FAIpQLSeyFrSD0amV3xig9dTMc1nRjsIIn7nQA5AmdJ-ivv1Bf-_GtQ/viewform?usp=dialog",
  alliance:    "https://docs.google.com/forms/d/e/1FAIpQLSc_EZtCujh58LvydOR_JounKFUdemI1g0iQkIOLwqCqsvlcLA/viewform?usp=sharing&ouid=115715606325516633822",
  herosMemoir: "https://docs.google.com/forms/d/e/1FAIpQLSe15poq_0Y6jkuxhzPvEEVi6JRUGRh172KHLOcRThKlE3YIyQ/viewform?usp=sharing&ouid=115715606325516633822",
};

function showRecordFormLink(form, key) {
  if (!form) return;
  const url = RECORD_FORM_LINKS[key];
  if (!url) return;

  let link = form.querySelector(".record-code-formlink");
  if (!link) {
    link = document.createElement("a");
    link.className = "record-code-formlink";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    form.appendChild(link);
  }
  link.href = url;
  link.textContent = key === "herosMemoir"
    ? "Open the final form →"
    : "Open the form for this log →";
}

function normalizeCode(value) {
  return value.trim().toLowerCase();
}

async function verifyRecordCode(recordKey, answer) {
  const response = await fetch("/api/verify-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recordKey, answer }),
  });

  if (!response.ok) {
    throw new Error("Verification request failed");
  }

  const payload = await response.json();
  return payload?.isCorrect === true;
}

function isRecordVerified(key) {
  if (!RECORD_KEYS.includes(key)) return false;
  return sessionStorage.getItem(`rv_code_${key}`) === "1";
}

function getVerifiedRecordCount() {
  // Only count the 3 logs (not the final report itself)
  return ["forensic", "instagram", "alliance"].filter(key => isRecordVerified(key)).length;
}

function areAllRecordCodesVerified() {
  return ["forensic", "instagram", "alliance"].every(key => isRecordVerified(key));
}

function refreshVaultStatus() {
  const statusEl = document.getElementById("vault-status");
  const checklistEl = document.getElementById("vault-checklist");

  if (statusEl) {
    const verified = getVerifiedRecordCount();
    statusEl.textContent = `This report unlocks only after all 3 log codes are entered correctly on their respective pages. ${verified} / 3 verified.`;
  }

  if (checklistEl) {
    const entries = [
      ["Log 1 — Forensic Report", "forensic"],
      ["Log 2 — Instagram Archive", "instagram"],
      ["Log 3 — Interrogation Log", "alliance"],
    ];

    checklistEl.innerHTML = entries.map(([label, key]) => {
      const verified = isRecordVerified(key);
      return `<li class="${verified ? "verified" : "pending"}">${verified ? "✓ " : ""}${label}</li>`;
    }).join("");
  }
}

function initRecordCodes() {
  const forms = document.querySelectorAll(".record-code-form");
  if (!forms.length) return;

  forms.forEach(form => {
    const panel = form.closest(".record-code-panel");
    const key = panel?.dataset.recordKey;
    const input = form.querySelector(".record-code-input");
    const feedback = form.querySelector(".record-code-feedback");
    const submit = form.querySelector("button[type='submit']");

    if (!key || !RECORD_KEYS.includes(key)) return;

    const existing = isRecordVerified(key);
    if (existing) {
      panel?.classList.add("verified");
      if (input) {
        input.value = "Verified";
        input.disabled = true;
      }
      if (submit) submit.disabled = true;
      if (feedback) {
        feedback.textContent = key === "herosMemoir"
          ? "Case closed."
          : "Code verified.";
      }
      showRecordFormLink(form, key);
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!input || !feedback || !submit) return;

      const value = normalizeCode(input.value);

      if (!value) {
        feedback.textContent = "Enter the code for this record.";
        form.classList.add("shake");
        setTimeout(() => form.classList.remove("shake"), 600);
        return;
      }

      submit.disabled = true;

      try {
        const isCorrect = await verifyRecordCode(key, value);

        if (!isCorrect) {
          feedback.textContent = "Incorrect code. Re-check the clues.";
          form.classList.add("shake");
          setTimeout(() => form.classList.remove("shake"), 600);
          submit.disabled = false;
          return;
        }

        sessionStorage.setItem(`rv_code_${key}`, "1");
        panel?.classList.add("verified");
        input.disabled = true;

        if (key === "herosMemoir") {
          input.value = "Verified";
          feedback.textContent = "Case closed.";
          showRecordFormLink(form, key);
        } else {
          input.value = "Verified";
          feedback.textContent = "Code verified. This log now counts toward the Final Report.";
          showRecordFormLink(form, key);
          refreshVaultStatus();

          if (areAllRecordCodesVerified()) {
            sessionStorage.setItem("rv_vault_open", "1");
            if (document.getElementById("vault-gate")) {
              unlockVault(true);
            }
          }
        }

      } catch (error) {
        feedback.textContent = "Verification service unavailable. Try again.";
        submit.disabled = false;
      }
    });
  });

  refreshVaultStatus();
}

function initVault() {
  const gate = document.getElementById("vault-gate");
  const content = document.getElementById("report-content");
  if (!gate || !content) return;

  refreshVaultStatus();

  if (areAllRecordCodesVerified()) {
    sessionStorage.setItem("rv_vault_open", "1");
    unlockVault(false);
  } else {
    sessionStorage.removeItem("rv_vault_open");
  }
}

function unlockVault(animate) {
  const gate    = document.getElementById("vault-gate");
  const content = document.getElementById("report-content");
  if (!gate || !content) return;

  gate.style.display = "none";
  content.classList.remove("hidden");
  if (animate) content.classList.add("reveal-anim");

  sessionStorage.setItem("rv_visited_vault", "1");
}

// ── Track visited pages for hub progress ─────────────────────────────────
const PAGE_KEYS = {
  "scout-logs.html":       "rv_v_forensic",
  "healer-records.html":   "rv_v_instagram",
  "alliance-docs.html":    "rv_v_alliance",
  "HerosMemoir.html":      "rv_v_hidden",
};

(function markCurrentPage() {
  const filename = window.location.pathname.split("/").pop();
  if (PAGE_KEYS[filename]) {
    sessionStorage.setItem(PAGE_KEYS[filename], "1");
  }
})();

function markVisitedCards() {
  const grid = document.querySelector(".hub-grid");
  if (!grid) return;

  const map = {
    "card-scout":      "rv_v_forensic",
    "card-healer":     "rv_v_instagram",
    "card-alliance":   "rv_v_alliance",
    "card-hidden":     "rv_v_hidden",
  };

  Object.entries(map).forEach(([id, key]) => {
    const card = document.getElementById(id);
    if (card && sessionStorage.getItem(key) === "1") {
      card.classList.add("card-visited");
    }
  });

  const total   = Object.keys(map).length;
  const visited = Object.values(map).filter(k => sessionStorage.getItem(k) === "1").length;
  const bar     = document.getElementById("progress-fill");
  const label   = document.getElementById("progress-label");
  if (bar)   bar.style.width = ((visited / total) * 100) + "%";
  if (label) label.textContent = visited + " / " + total + " records reviewed";
}

// ── Optional hint system (toggle) ────────────────────────────────────────
function initHintToggle() {
  const btn = document.getElementById("hint-toggle-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const panel = document.getElementById("hint-panel");
    if (!panel) return;
    const open = panel.classList.toggle("hint-visible");
    btn.textContent = open ? "Hide Guidance ▲" : "Show Guidance ▼";
  });
}

// ── Smooth scroll to top between pages ───────────────────────────────────
document.querySelectorAll("a.btn-nav, a.archive-card").forEach(link => {
  link.addEventListener("click", function (e) {
    if (this.href && !this.href.includes("#")) {
      document.body.classList.add("page-leaving");
    }
  });
});