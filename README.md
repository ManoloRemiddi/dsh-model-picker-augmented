# dsh-model-picker-augmented

> **MIT License** — Copyright (c) 2026 **Manolo Remiddi**
> SPDX-License-Identifier: MIT — see [LICENSE](LICENSE) for the full license text.

Searchable, curated composer model picker for [DeepSeek Harness](https://deepseek.com).

This plugin replaces the model picker in the composer with a searchable version
and adds a **Model Picker Augmented** settings page so you can control exactly which
models appear in the list and which ones are pinned to the top.

## Features

- **Live model search** — a search field at the top of the model list filters
  as you type, matching the model name **and** the provider name. Groups with
  no matches disappear; an empty query restores the full list.
- **Show / hide models** — hide models you never use from the picker list via
  the settings page. Hidden models stay listed in Settings (marked *Hidden*)
  so you can bring them back whenever you want.
- **Pin to top** — pin your favorite models; they render in a *Pinned* section
  at the very top of the model list (and are removed from their provider group
  below to avoid duplicates). Order them with the up/down arrows in Settings.
- **Refresh providers** — this button first forces
  the running harness to re-read `~/.dsh/settings.yaml` from disk, so
  providers and models you added to the file **appear without restarting the
  harness** — a new provider block in the file is served by the time the
  refresh finishes. It then re-reads the live catalog and, for every active
  provider that has a `baseURL`, checks the provider's endpoint and appends
  any models the file does not list yet to the provider's `models` list in
  `settings.yaml` — a provider that has a `baseURL` but no `models` list yet
  fills itself in with a single click, no hand-editing. If the file sync
  itself fails, the refresh continues and reports it (`settings.yaml sync
  failed: …`). The page also follows harness
  catalog changes pushed by the host (settings commits, adapter
  re-registrations, credential updates), so the view stays live.
- Keeps the rest of the picker exactly as shipped: the two-level Model/Effort
  menu, effort levels, keyboard navigation, error/retry states, and full sync
  with the `/model` command (both use the same shared model directory).

## Requirements

- DeepSeek Harness (`dsh`) `>= 0.1.5-rc.1` (verified with 0.1.5-rc.1)
- The web GUI profile (`--profile web`), which ships the dependencies this
  plugin builds on (`@deepseek-ai/dsh-client-ui-conversation`,
  `@deepseek-ai/dsh-client-ui-settings`, `@deepseek-ai/dsh-client-ui-model-selection`,
  `@deepseek-ai/dsh-client-locale`).

## Install

Install the tested **1.1.2** package directly from its GitHub release:

```bash
dsh plugin --profile web add https://github.com/ManoloRemiddi/dsh-model-picker-augmented/releases/download/v1.1.2/dsh-model-picker-augmented-1.1.2.tgz
```

Restart DSH and reload its web page. This package is distributed through
GitHub Releases; it is not published on npm. Existing users with a `link:`
installation should update their linked checkout to tag `v1.1.2` instead
of adding a second copy. Keep your current settings and model credentials.

For a source installation:

The plugin is a DSH bundle patch package (same pattern as other hot-pluggable
web plugins):

```bash
git clone --branch v1.1.2 --depth 1 https://github.com/ManoloRemiddi/dsh-model-picker-augmented.git
cd dsh-model-picker-augmented
pnpm install
dsh plugin --profile web add link:$(pwd)
```

`pnpm install` matters: `link:` packages resolve their dependencies from their
own directory, and the node half needs `schemastery` for the durable settings
namespace. Then restart the harness (or reload the web GUI). The composer model
picker is now the searchable one and a **Model Picker Augmented** page appears
under **Settings → Model Picker Augmented**.

To remove it:

```bash
dsh plugin --profile web remove dsh-model-picker-augmented
```

## Usage

1. Open any session and click the model picker at the right end of the
   composer tool row.
2. Enter **Model** to open the list — type in the search field at the top to
   filter (e.g. `qwen` shows only Qwen models and the providers that carry
   them; clear the field to show everything again).
3. Open **Settings → Model Picker Augmented** to curate:
   - **Visible / Hidden** toggles per model (hidden models vanish from the
     picker, stay listed here, and can be re-enabled at any time).
   - **Pin to top** per model, with up/down arrows to order the pinned section.
   - **Refresh providers** to sync the running harness with `settings.yaml` (file-added
     providers and models appear without a restart) and to check provider
     endpoints for new models; see *How it works* below.

## How it works

- The browser half registers into the composer's named model seat
  (`conversation.input.model`) with a shadowing priority, and into the
  settings panel (`settings.section`).
- Model data comes from the harness itself: the picker reads the same
  per-session advisory directory the shipped picker uses (the
  `modelDirectories` service), and the settings page fetches the global
  catalog through the Remote API (`remote.session.modelCatalog`). The plugin adds no
  model data of its own — if a model is missing from the picker, it is missing
  from your configured provider catalogs (see below).
- Curation (hidden models + pinned order) is **persisted durably on your
  machine**: the node half registers a `model-picker-augmented` settings
  namespace, and every change is written through the harness settings system
  into `~/.dsh/settings.yaml` (`model-picker-augmented: { hidden: …,
  pinned: … }`), so your pins and hidden models survive page refreshes,
  browser restarts, and machine restarts. On startup the browser half hydrates
  the picker from that stored value.
- **Refresh providers** (settings page) runs in two stages, only when you click it:
  1. **Sync the harness with `settings.yaml`.** It issues a no-op write
     through the settings commit API to the plugin's own
     `model-picker-augmented` namespace. Every settings write forces the
     harness to re-read `settings.yaml` from disk before persisting, and any
     file that has drifted — providers or models added by hand while the
     harness was running — is re-published through the normal settings
     pipeline, so their routes are re-registered **live, without a restart**.
     Only the plugin's curation section is rewritten; every other section of
     the file passes through untouched (comments included). If this step
     fails, the refresh continues with the in-memory catalog and reports
     `settings.yaml sync failed: …`.
  2. **Re-read the catalog and sync the endpoints.** It then fetches
     `remote.session.modelCatalog` (catalog + per-provider failures),
     `remote.llm.listProviders` and `remote.llm.listConfigurableProviders`
     (active routes and their settings locations), and `remote.settings.describe` (current `llm-pi-ai` profiles
     + revision). For every active provider with a `baseURL` whose group
     serves real models it calls `remote.llm.discoverModels` against that
     `baseURL` (stored credentials are used automatically) and appends any
     models the file does not list yet to the provider's `models` list with
     a single revision-checked `settings.mutate` write; a provider with a
     `baseURL` but no `models` list yet gets the reply adopted as its full
     list. Missing `name`/`contextWindow`/`maxTokens` are filled with the
     harness defaults. The write goes through the settings commit API (not a
     raw file edit), so `settings.yaml` stays the source of truth and the
     running harness picks the new models up immediately; the composer
     picker follows via the host's `settings/document-updated` /
     `llm/adapters-updated` events.

  Nothing else is written: stage 1 touches only the
  `model-picker-augmented` section, stage 2 only appends — existing model
  entries are never rewritten, and providers without a `baseURL` are
  skipped.

## Notes on model availability

The picker can only show models the locally installed provider catalogs know.
`zai` and `openrouter` providers fall back to the bundled pi-ai catalog unless
their `llm-pi-ai` profile in `settings.yaml` carries an explicit `models` list
(which then **replaces** the bundled catalog). New models announced by a
provider (e.g. a new GLM or Qwen tier) only appear once added to that list.

### Adding models a provider announced but your catalog lacks

The fastest path is the **Refresh providers** button on the Model Picker Augmented
page: add a provider block under `llm-pi-ai.providers` in `settings.yaml`
(give it a `baseURL` and an API key if the endpoint needs one) and click
Refresh. Refresh first syncs the running harness with the file — no restart
needed — then pulls the provider's model list from the endpoint and writes it
into `settings.yaml` for you. You can
also use the shipped **Settings → Models** page (its fetch-from-endpoint
flow pulls the current catalog from the provider), or edit
`~/.dsh/settings.yaml` directly. Each entry needs `id`, `name`,
`contextWindow`, and `maxTokens` (positive integers). Because an explicit
`models` list replaces the bundled catalog, list **every** model you want to
see — entries you omit disappear from the picker:

```yaml
# ~/.dsh/settings.yaml — llm-pi-ai section (example: Z.ai)
llm-pi-ai:
  providers:
    zai:
      apiKeyEnv: ZAI_API_KEY
      models:
        - id: glm-4.5-air
          name: GLM-4.5-Air
          contextWindow: 131072
          maxTokens: 98304
        - id: glm-5.3
          name: GLM-5.3
          contextWindow: 1048576
          maxTokens: 131072
        - id: glm-5.3-flash
          name: GLM-5.3-Flash
          contextWindow: 1048576
          maxTokens: 131072
        # …plus every other zai model you want to keep
```

The same applies to `openrouter` (e.g. `qwen/qwen3.8-max`). File edits are
picked up by the running harness on your next **Refresh providers** click: Refresh providers
first syncs `settings.yaml` into the harness (no restart), then checks the
endpoints for new models. If a Refresh reports `settings.yaml sync failed:
…`, the file was not applied — check the YAML (for example, a declared
provider without a catalog entry needs a `baseURL`) and click Refresh again.
Real specs come from the provider (Z.ai docs, OpenRouter) — or let the
fetch-from-endpoint flow fill them in.

## License

MIT — Copyright (c) 2026 Manolo Remiddi. See [LICENSE](LICENSE).

Every source file carries the MIT header; `package.json` states it via the
`license` and `author` fields.

## DSH 0.1.5 compatibility (1.1.2)

Version 1.1.1 used the removed `connection.api` browser interface and could
stop the DSH GUI with “Cannot read properties of undefined (reading settings)”.
Version 1.1.2 declares the scoped `remote.settings`, `remote.llm`, and
`remote.session` dependencies and uses their current methods, positional
arguments and Result values. Pins and hidden models retain their existing
settings namespace and format.

Run `pnpm test` for regression coverage of client initialization, curation
writes, provider discovery, revision-checked model additions and catalog
errors. Tests use an in-memory settings service and never access credentials
or live model endpoints.

Verified on 2026-09-10 with DSH 0.1.5-rc.1 and Chromium 152: the complete
DSH GUI loads without plugin failures, composer search filters models, the
settings catalog renders, and a pin survives a page reload. The temporary
test pin was removed and the original curation settings were verified intact.
