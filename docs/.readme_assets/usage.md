Start the site, inside the dev shell (`nix develop`), which sets its `PORT`:

```sh
nix run .#dev
```

A point is at `http://clermont-ferrand.localhost:$PORT/fr` (every `*.localhost` resolves
to your machine), the brand page at `http://localhost:$PORT/fr`.

Run the checks:

```sh
nix run .#test           # tsc, eslint, vitest, build, bundle budget, Playwright
nix run .#size           # first-load JS of a point page against tests/bundle_budget.txt
nix run .#figma-parity   # compares the card with the Figma export
nix flake check          # the hermetic Nix build, and the budget against it
```

The bundle budget is the one hard gate. Raising `tests/bundle_budget.txt` is a
deliberate commit that says why.

Build the server and the container image:

```sh
nix build                # the standalone server
nix build .#container    # OCI image, on Linux
```

The image listens on the flake's `sitePort` and keeps its leads in `/data/leads.db`; `/data` is
the mount. Its non-secret settings come from `deploy/config.nix`. Secrets —
`SMTP_URL`, `SMS_TOKEN`, and the lead webhook's `LEAD_WEBHOOK_URL`,
`LEAD_WEBHOOK_KEY_ID`, `LEAD_WEBHOOK_SECRET` (all three or none) — come only
from the container's environment. Pushing a `v*` tag builds the image and publishes it to
`ghcr.io/service-arb/aquafix`, which deploys it: `nix run .#publish` makes the
tag.

### Local stack

The Service-Arb panel's `nix run .#local-stack` starts this site beside the
panel. `nix run .#dev` and `npm run dev` read the same environment the image
does. From inside this checkout (the dev app refuses another working tree),
with the conductor and sites_panel at the origins the stack prints:

```sh
SITES_PANEL_INTERNAL_URL=<sites_panel>/api/internal \
LEAD_WEBHOOK_URL=<the conductor>/api/ingest/v1/events \
LEAD_WEBHOOK_KEY_ID=<the panel source's key id> LEAD_WEBHOOK_SECRET=<its secret> \
LEADS_DB_PATH=/tmp/aquafix/leads.db \
nix run .#dev
```

- `PORT` — the dev shell's; `nix run .#dev` refuses to start without it.
- `SITES_PANEL_INTERNAL_URL` — sites_panel's internal API; the place source
  fetches `<it>/brands/aquafix/locations/<slug>?locale=<fr|en>` from it; the live phone, WhatsApp,
  hours, address and rating override the baked point in the hero, the call
  bar, the footer, the JSON-LD and the quote card. Unset, the baked points
  are served. A fetched point is cached for 600 s (`PLACE_REVALIDATE_SECONDS`).
  The same API answers `<it>/brands/aquafix/experiments`: the panel's weights and kill
  switch for the A/B tests (docs/EXPERIMENTS.md), cached in memory for 30 s.
  Unset, the config in code runs.
- `LEAD_WEBHOOK_*` — all three or none; `http:` only to `localhost`,
  `127.0.0.1` or a `*.svc` host. Through it, at every start, the panel is
  also told which experiments the build runs (`experiments.declared`).
- `LEADS_DB_PATH` — the leads file and the webhook outbox; unset, it is
  `~/.local/share/aquafix/leads.db`.
- `POSTHOG_KEY` — unset, analytics sends nothing.

A point is then `http://clermont-ferrand.localhost:$PORT/fr`.
Each arm of the lead form test is one link away: `/fr?ab_lead_form=a`, `b` or `c`
(docs/EXPERIMENTS.md).

### Visual baselines

Screenshot baselines are Linux's, because CI is: a mac rasterises glyphs
differently, so locally the pixel comparison is skipped (`AQUAFIX_SNAPSHOTS=1`
shoots anyway, to look). To refresh them after changing a section:

1. Run the **Visual baselines** workflow on the branch
   (`gh workflow run visual-baselines.yml --ref <branch>`). Before that workflow
   exists on `main`, a CI run of **Errors** on the branch writes any missing
   baseline and publishes the same artifact.
2. `gh run download <run-id> -n visual-snapshots -D tests/e2e/__screenshots__`
3. Look at the images, then commit them alone:
   `test: refresh visual baselines (run <run-id>)`.

On Linux, `nix run .#accept-test` does the same locally; `-- <name>` for a subset.

`nix run .#help` prints the list of commands.
