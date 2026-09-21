# null

A sequential online puzzle game in the tradition of *notpron*.
Twenty pages, each one pointing at the next.
Solve the puzzle on a page → the answer is the URL slug of the next page.

Live: **https://null.inpriv.xyz**

> [!WARNING]
> **This repo is open source and contains the full source for every
> page.** If you are planning to play the game, you should stop reading
> this README now. The folder layout, the level filenames, the
> numbers in the headers — all of it spoils the puzzle. Treat this
> repository as post-game reference material.

## What this game is

A short chain of small puzzles that you solve in a browser. Each
puzzle's answer is the URL of the next page in the chain. Getting it
wrong returns a 404. There is no login, no progress to save, no score.
The whole thing fits in a single browser tab.

The chain is open-source — anyone who reads this repo will see every
level, every trick, and every flag. The interesting design question
isn't how to hide the answers from curious players. It is how to
make the *in-game* surface honest about the chain's true length
without making the *source* surface dishonest about it.

<details>
<summary><strong>Maintainer notes</strong></summary>

The player is told on the landing page that there are fifteen
levels. Every counter in the first half of the chain reads
`Level N of 15`. The puzzle that ends the visible chain looks
exactly like every other puzzle: a normal page, a normal link
forward, normal atmosphere, normal hint button.

If the player trusts that link and keeps going, they will eventually
notice the level counter is no longer counting toward fifteen. By
that point they have already solved four or five levels that the
landing page said did not exist. A handful of players will then go
looking; the rest will treat the visible ending as final and move on.

The chain is, of course, longer than fifteen. That fact is
available from the very first line of this README and from the
repo description on GitHub. The in-game surface keeps it hidden —
not from anyone willing to look, but from anyone who only plays.

</details>

## Repo layout

<details>
<summary><strong>Project structure</strong></summary>

```
.
├── _headers          # Cloudflare Pages — custom response headers
├── _redirects        # Cloudflare Pages — redirects
├── 404.html          # Used for unknown URLs (with "go back" button)
├── index.html        # Landing page
├── assets/
│   ├── base.css      # shared stylesheet
│   ├── base.js       # shared client behaviour
│   ├── dot.png       # 1×1 transparent utility
│   └── favicon.png
├── functions/
│   └── _middleware.js  # Pages Function: maintenance gate against admin state
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
├── null/             # Level 15 (mid-chain, not an ending — see README below)
├── kettle/           # Level 16
├── binary/           # Level 17
├── watcher/          # Level 18
├── exit/             # Level 19
└── deeper/           # Level 20
```

Each folder is self-contained: `index.html` plus any per-level CSS,
images, or scripts it needs. The shared stylesheet and JS are in
`assets/`. No build step.

`SOLUTIONS.md` exists locally for QA but is **gitignored** and never
pushed to this repo.

</details>

## Run locally

There is no build step. Open `index.html` directly in a browser, or:

```bash
# from the project root
python -m http.server 8000
# then visit http://localhost:8000/
```

`_redirects` and `X-Next` HTTP headers are Cloudflare-Pages-only. They
won't fire under `python -m http.server`. Two of the levels won't
redirect locally; they will on the live site.

## Maintenance gate (operator info)

The site is wrapped in a Cloudflare Pages Function (`functions/_middleware.js`)
that checks the public kill-switch state served by `admin.inpriv.xyz`
every request. When an operator toggles the `null` switch (or the
global switch) in the admin dashboard, the game is replaced with a
maintenance page until the switch is flipped back. The function
fails open if the admin endpoint is unreachable.

## Add a new level

<details>
<summary><strong>Adding a level — checklist</strong></summary>

1. Pick a short slug (one word, lowercase). It becomes both the folder
   name and the answer other levels must point at.
2. Create `<slug>/index.html`. Copy the `<head>` from any existing
   level and replace `<title>` and the body.
3. Include a hint slot near the bottom:

   ```html
   <div class="hints" data-h1="a subtle hint"></div>
   ```

   Only `data-h1` is used (a single subtle nudge). If the string is
   empty, no hint button is shown for that page.
4. If the level needs CSS, image, or a JS file, put them in `<slug>/`.
   Shared styles live in `assets/base.css` — extend, don't fork.
5. From the previous level, link to `/<slug>/` (in an HTML comment, a
   hidden link, an `X-Next` header, base64, etc. — pick a new technique).
6. Add a row to your local `SOLUTIONS.md` (kept off the repo).
7. QA by walking the chain. Verify every link from level N actually
   loads level N+1.

</details>

## Design rules

<details>
<summary><strong>Design notes</strong></summary>

- No accounts, no login, no server-side answer checking. Getting it
  wrong = 404. That is the whole game.
- Never block or obscure view-source, right-click, or devtools.
- Everything must be solvable with a normal browser plus common
  free tools (text editor, online base64/ROT13 decoder).
- Ramp difficulty gradually. Levels 1–3 are a tutorial.
- Never repeat the same trick two levels in a row.
- No dead ends — every clue points at something concretely present.
- Light misdirection is welcome (decoy links, plausible-but-wrong
  answers) as long as the real clue is fair and findable.
- Every page sets `noindex,nofollow`. No sitemap. No `robots.txt`.
- The page **body** holds atmosphere only. Real hints live behind
  the inline button, in the source, in response headers, or in the
  bytes of files that pretend to be other things.

</details>

## Deploy

The site is a static directory. Deploy the project root:

```bash
wrangler pages deploy . --project-name null
```

Cloudflare picks up `_headers` and `_redirects` automatically. The
Functions bundle is detected from `functions/` and bundled into the
deployment.

## Conventions

- `<meta name="robots" content="noindex,nofollow">` on every page.
- No sitemap. A sitemap would list every answer at once.
- `localStorage` keys use the `null:` prefix. Two are used:
  `null:last` (last URL visited, for refresh-storms) and `null:gave_up`
  (set by an optional give-up link on `/deeper/`, cleared when the
  player finishes there).
- Plain HTML + CSS + vanilla JS. No framework, no build step.
- All assets are versioned via query strings (`?v=N`) in the HTML to
  force cache invalidation on deploy.

## License

MIT. Use it, fork it, host your own variant. If you make a fork that
tells players they are inside a real chain of fifteen levels, that
is your call.