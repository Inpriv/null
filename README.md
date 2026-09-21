# null

A sequential online puzzle game in the tradition of *notpron*.
Fifteen pages, each one pointing at the next.
Solve the puzzle on a page → the answer is the URL slug of the next page.

Live: **https://null.inpriv.xyz** (or the Pages dev URL while the custom
domain is being attached).

## Repo layout

```
.
├── _headers          # Cloudflare Pages — custom response headers (X-Next)
├── _redirects        # Cloudflare Pages — redirects (beacon/0 → zero)
├── index.html        # Landing page (level 0)
├── assets/           # Shared CSS, JS, favicon
│   ├── base.css
│   ├── base.js
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
└── null/             # Level 15 (end of chain)
```

## Run locally

There is no build step. Open `index.html` directly in a browser, or:

```bash
# from the project root
python -m http.server 8000
# then visit http://localhost:8000/
```

Some browsers (Chrome, Firefox) refuse to load SVG `<desc>` as
view-source in `file://` mode in some cases — serving over HTTP is the
smoother way to QA.

## Add a new level

1. Pick a short slug (one word, lowercase). It becomes both the folder
   name and the answer other levels must point at.
2. Create `<slug>/index.html`. Copy the `<head>` from any existing level
   and replace `<title>` and the body.
3. If the level needs CSS, image, or a JS file, put them in `<slug>/`.
   Shared styles live in `assets/base.css` — extend, don't fork.
4. From the previous level, link to `/<slug>/` (in an HTML comment, a
   hidden link, an `X-Next` header, base64, etc. — pick a new technique).
5. Add a row to `SOLUTIONS.md` (kept local, not committed).
6. QA by walking the chain. Verify every link from level N actually
   loads level N+1.

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