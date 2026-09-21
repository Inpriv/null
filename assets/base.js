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
//    text input named "a" submits to /<value>/ on Enter.
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
function maybeShowGaveUp() {
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;
  try {
    if (localStorage.getItem("null:gave_up") !== "true") return;
  } catch (_) { return; }

  const note = document.createElement("p");
  note.className = "faintest gave-up-note";
  note.textContent = "you gave up once. the game remembers.";
  const main = document.querySelector("main");
  if (main) main.insertBefore(note, main.firstChild);
}

// 5. wire a button with class="give-up" to set the flag then go home.
function wireGiveUp() {
  document.querySelectorAll(".give-up").forEach((el) => {
    el.addEventListener("click", function (e) {
      try { localStorage.setItem("null:gave_up", "true"); } catch (_) {}
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  wireAnswerForms();
  wireGiveUp();
  maybeShowGaveUp();
});

// 6. three-stage hint panel — implemented inline so we don't depend on a
//    second HTTP fetch that defer-timing can swallow.
//    Pages opt in by including <div class="hints" data-h1 data-h2 data-a>.
(function () {
  if (window.__nullHintInit) return;
  window.__nullHintInit = true;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const slot = document.querySelector(".hints");
    if (!slot) return;

    const h1 = slot.getAttribute("data-h1") || "";
    const h2 = slot.getAttribute("data-h2") || "";
    const ans = slot.getAttribute("data-a")  || "";

    // Wrap the slot + button in a centered container so the button
    // sits inline with the panel, not pinned to a screen corner.
    const wrap = document.createElement("div");
    wrap.className = "hint-area";
    slot.parentNode.insertBefore(wrap, slot);
    wrap.appendChild(slot);

    slot.classList.add("hint-panel");
    slot.setAttribute("aria-live", "polite");
    slot.innerHTML = "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hint-toggle";
    btn.textContent = "hint";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Reveal a hint");

    let stage = 0;
    function render() {
      const label =
        stage === 0 ? "" :
        stage === 1 ? "Hint 1 — " :
        stage === 2 ? "Hint 2 — " :
                      "Answer — ";
      const body =
        stage === 0 ? "" :
        stage === 1 ? h1 :
        stage === 2 ? h2 :
                      ans;
      slot.textContent = label + body;
      btn.setAttribute("aria-expanded", stage > 0 ? "true" : "false");
      btn.textContent = stage === 0 ? "hint" : "hide";
    }

    btn.addEventListener("click", function () {
      stage = (stage + 1) % 4;
      render();
    });

    // Button above the panel (panel reveals below it).
    wrap.appendChild(btn);
    render();
  });
})();