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

// 4. "I gave up" silent honeypot. If localStorage.null:gave_up is true,
//    show a single extra line at the top of the landing page only.
//    Quiet. No nag. The player knows.
function maybeShowGaveUp() {
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;
  try {
    if (localStorage.getItem("null:gave_up") !== "true") return;
  } catch (_) { return; }

  const note = document.createElement("p");
  note.className = "faintest gave-up-note";
  note.textContent = "you gave up once. the game remembers.";
  // insert as first paragraph in <main>
  const main = document.querySelector("main");
  if (main) main.insertBefore(note, main.firstChild);
}

// 5. wire a button with class="give-up" to set the flag then go home.
function wireGiveUp() {
  document.querySelectorAll(".give-up").forEach((el) => {
    el.addEventListener("click", function (e) {
      try { localStorage.setItem("null:gave_up", "true"); } catch (_) {}
      // Let the link's default href=/ still happen.
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  wireAnswerForms();
  wireGiveUp();
  maybeShowGaveUp();
});

// 6. load the hint panel on demand (small, async-safe).
(function () {
  var s = document.createElement("script");
  s.src = "/assets/hint.js";
  s.defer = true;
  document.head.appendChild(s);
})();