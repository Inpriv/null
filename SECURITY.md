# Security

If you find a security issue in `null.inpriv.xyz` — an XSS, an
open redirect, a header injection, anything that could affect a
player's browser or data — please open a GitHub issue with the
`security` label. Do not include exploit payloads in the public
ticket; the maintainer will follow up privately.

The site is static HTML plus a single Cloudflare Pages Function.
There are no user accounts, no stored credentials, no server-side
state per player. The only writes to `localStorage` are the two keys
documented in the README.

If your concern is the puzzle itself — answers leaked through
source, easy walkthroughs in commit history — that is a design
issue, not a security one. Open a regular issue.