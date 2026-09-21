// null — shared client behaviour.
// Loaded by every level. Each level may extend it.

// 1. optional: remember the last URL reached (purely convenience, never a hint).
try {
  const here = window.location.pathname;
  if (here && here !== "/" && here !== "/index.html") {
    localStorage.setItem("null:last", here);
  }
} catch (_) { /* private mode etc. */ }

// 2. form-to-url helper: any <form class="answer-form"> with a single
//    text input named "a" submits to /<value>/ on Enter. Case-insensitive,
//    trimmed, spaces collapsed. This is the *only* standard interaction;
//    most levels don't even need it.
function wireAnswerForms() {
  document.querySelectorAll("form.answer-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="a"]');
      if (!input) return;
      const v = (input.value || "").trim().toLowerCase().replace(/\s+/g, "-");
      if (!v) return;
      window.location.href = "/" + encodeURIComponent(v) + "/";
    });
  });
}

// 3. console easter-egg: surface a hint about inspecting.
(function () {
  if (!window.console || !console.log) return;
  console.log(
    "%cnull",
    "color:#8ab4ff;font:16px monospace;",
    "\nview-source is your friend."
  );
})();

document.addEventListener("DOMContentLoaded", wireAnswerForms);