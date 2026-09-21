// null/hint.js
// ----------------------------------------------------------------------
// Three-stage hint system. Loaded by every page (via base.js).
//
// A page may include <div class="hints" data-h1="..." data-h2="..." data-a="..."></div>
// to register hints. Without that, this script does nothing.
//
// The button sits in the bottom-right corner. Clicking it cycles:
//
//   hidden   →  "Hint 1: <subtle>"   (1st click)
//   "Hint 1" →  "Hint 2: <literal>"  (2nd click)
//   "Hint 2" →  "Answer: <answer>"   (3rd click)
//   "Answer" →  hidden again         (4th click — and resets)
//
// We do NOT persist which stage the player is on. Reloading the page
// hides everything again, on purpose: hints should never become a
// passive reference you can scroll back to.
//
// Final answer text is rendered in a way that, if the player *copies*
// it and pastes it into the address bar, it just works. If they
// merely read it, fine — but no autocomplete, no animation, no reveal.
// ----------------------------------------------------------------------

(function () {
  if (window.__nullHintInit) return;
  window.__nullHintInit = true;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const slot = document.querySelector(".hints");
    if (!slot) return; // page doesn't want hints

    const h1 = slot.getAttribute("data-h1") || "";
    const h2 = slot.getAttribute("data-h2") || "";
    const ans = slot.getAttribute("data-a")  || "";

    // Style the slot as the hint panel itself.
    slot.classList.add("hint-panel");
    slot.setAttribute("aria-live", "polite");
    slot.innerHTML = ""; // we own it now

    // Floating button bottom-right.
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hint-toggle";
    btn.textContent = "hint";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Reveal a hint");

    let stage = 0; // 0 hidden, 1..3 shown
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

    // Don't trap keyboard / screen-reader users; everything is real DOM.
    document.body.appendChild(btn);
    render();
  });
})();