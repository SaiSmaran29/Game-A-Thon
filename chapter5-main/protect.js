/* Deters copying and screenshots for participants.
   Note: browser/OS-level screenshots cannot be fully blocked; this is best-effort. */
(function () {
  "use strict";

  // Allow normal typing/selection inside form fields only.
  function inEditable(el) {
    if (!el) return false;
    var tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || el.isContentEditable;
  }

  // Block right-click context menu.
  document.addEventListener("contextmenu", function (e) {
    if (!inEditable(e.target)) e.preventDefault();
  });

  // Block copy / cut / select-start / drag.
  ["copy", "cut", "selectstart", "dragstart"].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      if (!inEditable(e.target)) e.preventDefault();
    });
  });

  // Block copy/save/view-source/devtools keyboard shortcuts.
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();

    // PrintScreen: clear clipboard as a deterrent.
    if (k === "printscreen") {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
      } catch (err) {}
      return;
    }

    if (e.key === "F12") {
      e.preventDefault();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && !inEditable(e.target)) {
      if (["c", "x", "a", "s", "u", "p"].indexOf(k) !== -1) {
        e.preventDefault();
      }
      // DevTools: Ctrl+Shift+I/J/C
      if (e.shiftKey && ["i", "j", "c"].indexOf(k) !== -1) {
        e.preventDefault();
      }
    }
  });
})();
