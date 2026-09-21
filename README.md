# null

A sequential online puzzle game in the tradition of *notpron*.
**Twenty pages**, each one pointing at the next.
Solve the puzzle on a page → the answer is the URL slug of the next page.
There is a false ending at `/null/` and a real one at `/deeper/`. Most players never find the second.

Live: **https://null.inpriv.xyz**

## Repo layout

```
.
├── _headers          # Cloudflare Pages — custom response headers (X-Next)
├── _redirects        # Cloudflare Pages — redirects (beacon/0 → zero)
├── 404.html          # Used for unknown URLs (with "go back" button)
├── index.html        # Landing page (level 0)
├── assets/
│   ├── base.css      # shared stylesheet
│   ├── base.js       # shared client behaviour (hint loader, give-up flag)
│   ├── hint.js       # the three-stage hint panel and button
│   ├── dot.png       # 1×1 transparent utility
│   └── favicon.svg
├── first/            # Level 1
├── blink/            # Level 2
├── mirror/           # Level 3
├── source/           # Level 4
├── cafe/             # Level 5
├── shadow/           # Level 6
├── grain/            # Level 7
├── python/           # Level 8
├── cipher/           # Level 9
├── beacon/           # Level 10
├── zero/             # Level 11
├── hollow/           # Level 12
├── doors/            # Level 13
├── encore/           # Level 14
├── null/             # Level 15 (FALSE END — see comment at the bottom of this file)
├── kettle/           # Level 16
├── binary/           # Level 17
├── watcher/          # Level 18
├── exit/             # Level 19
└── deeper/           # Level 20 (REAL END)
```

## Run locally

There is no build step. Open `index.html` directly in a browser, or:

```bash
# from the project root
python -m http.server 8000
# then visit http://localhost:8000/
```

`_redirects` and `X-Next` HTTP headers are Cloudflare-Pages-only — they
won't fire under `python -m http.server`. Levels 4 and 10 won't redirect
locally. They will on the live site.

## Add a new level

1. Pick a short slug (one word, lowercase). It becomes both the folder
   name and the answer other levels must point at.
2. Create `<slug>/index.html`. Copy the `<head>` from any existing level
   and replace `<title>` and the body.
3. Include a hint slot near the bottom:

   ```html
   <div class="hints"
        data-h1="subtle direction"
        data-h2="literal direction"
        data-a="the answer URL"></div>
   ```

   If `data-a` is empty the hint button is not shown for that page.
4. If the level needs CSS, image, or a JS file, put them in `<slug>/`.
   Shared styles live in `assets/base.css` — extend, don't fork.
5. From the previous level, link to `/<slug>/` (in an HTML comment, a
   hidden link, an `X-Next` header, base64, etc. — pick a new technique).
6. Add a row to `SOLUTIONS.md` (kept local, not committed).
7. QA by walking the chain. Verify every link from level N actually
   loads level N+1.

## Hints, decoys, and the false end

- Every page has a small inline **hint** button centered below the content.
  It cycles through three stages: subtle → literal → answer. The state is
  not persisted — reloading the page hides everything again.
- Some pages plant a **decoy link** (a plausible-looking path that 404s).
  These are documented in `SOLUTIONS.md`.
- **`/null/` is the false ending.** A comment at the very bottom of
  the file tells the player the real end is `/deeper/`. Most players
  stop reading before that point.
- **`/deeper/` clears the "gave up" flag.** Until the player finishes
  there, the `null:gave_up` flag in `localStorage` (set by an optional
  "give up" link on `/deeper/`) makes the landing page show one extra
  line: "you gave up once. the game remembers."

## Deploy

The site is a static directory. Deploy the project root:

```bash
wrangler pages deploy . --project-name null
```

Cloudflare will pick up `_headers` and `_redirects` automatically.

## Conventions

- `<meta name="robots" content="noindex,nofollow">` is on every page — do
  not rely on `robots.txt` (and there is no `robots.txt`; the game uses
  the absence of one as a clue sometimes).
- No sitemap.xml. A sitemap would list every answer at once.
- `localStorage` stores the last URL visited purely as a convenience
  for refresh-storms; never displayed in the UI.
- Plain HTML + CSS + vanilla JS. No framework, no build step.