/**
 * MIT License
 *
 * Copyright (c) 2026 Manolo Remiddi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// dsh-model-picker-augmented browser half.
// Replaces the composer model picker (conversation.input.model) with a
// searchable, curated version and registers the "Model Picker Augmented" settings page.
// Loaded by the web client module system via the "./client" export.

window.__ModuleLoader__.load({
	id: "dsh-model-picker-augmented",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");
		const inject = ['slots', 'sessions', 'modelDirectories', 'locale', 'timer', 'connection', 'remote'];
		function apply(ctx) {
		    const NS = 'modelPicker'
		    const zh = {
		      'trigger.fallback': '选择模型',
		      'trigger.selectAria': '选择模型',
		      'trigger.aria': '选择模型，当前 {model}',
		      'trigger.ariaEffort': '选择模型，当前 {model}，推理等级 {effort}',
		      'menu.aria': '模型与推理等级',
		      'menu.model': '模型',
		      'menu.effort': '推理等级',
		      'effort.providerDefault': 'Default',
		      'status.loading': '正在刷新模型列表…',
		      'error.action': '模型操作失败：{message}',
		      'retry': '重试',
		      'warning.groupLoad': '{name} 加载失败：{message}',
		      'empty.models': '没有可用的模型。',
		      'empty.efforts': '当前模型未提供推理等级。',
		      'search.placeholder': '搜索模型…',
		      'search.clear': '清除搜索',
		      'search.noResults': '没有与搜索匹配的模型。',
		      'search.pinned': '置顶',
		      'empty.curated': '所有模型都已隐藏——请在 设置 → 模型选择器增强版 中开启。',
		      'settings.title': '模型选择器增强版',
		      'settings.intro': '选择在输入栏模型选择器中显示的模型，并将常用模型置顶。设置立即生效，并在插件运行期间保持。',
		      'settings.searchPlaceholder': '搜索模型…',
		      'settings.loading': '正在加载模型目录…',
		      'settings.loadError': '目录加载失败：{message}',
		      'settings.retry': '重试',
		      'settings.pinned': '置顶',
		      'settings.visible': '显示',
		      'settings.hidden': '隐藏',
		      'settings.pin': '置顶',
		      'settings.unpin': '取消置顶',
		      'settings.moveUp': '上移',
		      'settings.moveDown': '下移',
		      'settings.noMatches': '没有与搜索匹配的模型。',
		      'settings.empty': '没有可用的模型。',
		      'settings.refresh': '刷新提供商',
		      'settings.refreshing': '正在刷新…',
		      'settings.refreshed': '目录已刷新：{providers} 个提供商，共 {models} 个模型。',
		      'settings.adopted': '已从 {name} 端点发现 {count} 个模型并添加到目录。',
		      'settings.synced': '已从 {name} 端点发现 {count} 个新模型并加入目录。',
		      'settings.noNewModels': '已检查 {count} 个 provider 端点，没有可添加的新模型。',
		      'settings.kickFailed': 'settings.yaml 同步失败：{message}（文件中的新 provider 可能未生效）。',
		      'settings.stale': '{name} 已在设置中声明，但当前运行的 harness 未提供它——请重启 harness 使其生效。',
		      'settings.discoverFailed': '无法为 {name} 发现模型：{message}',
		      'settings.noDiscovered': '{name} 的端点未返回任何模型。',
		      'settings.refreshFailed': '刷新失败：{message}',
		    }
		    const en = {
		      'trigger.fallback': 'Select model',
		      'trigger.selectAria': 'Select model',
		      'trigger.aria': 'Select model, current {model}',
		      'trigger.ariaEffort': 'Select model, current {model}, reasoning effort {effort}',
		      'menu.aria': 'Model and reasoning effort',
		      'menu.model': 'Model',
		      'menu.effort': 'Effort',
		      'effort.providerDefault': 'Default',
		      'status.loading': 'Refreshing model list…',
		      'error.action': 'Model operation failed: {message}',
		      'retry': 'Retry',
		      'warning.groupLoad': '{name} failed to load: {message}',
		      'empty.models': 'No models available.',
		      'empty.efforts': 'This model provides no reasoning effort levels.',
		      'search.placeholder': 'Search models…',
		      'search.clear': 'Clear search',
		      'search.noResults': 'No models match your search.',
		      'search.pinned': 'Pinned',
		      'empty.curated': 'All models are hidden — show some in Settings → Model Picker Augmented.',
		      'settings.title': 'Model Picker Augmented',
		      'settings.intro': 'Choose which models appear in the composer model picker and pin favorites to the top. Changes apply immediately and are kept while this plugin runs.',
		      'settings.searchPlaceholder': 'Search models…',
		      'settings.loading': 'Loading model catalog…',
		      'settings.loadError': 'Catalog failed to load: {message}',
		      'settings.retry': 'Retry',
		      'settings.pinned': 'Pinned',
		      'settings.visible': 'Visible',
		      'settings.hidden': 'Hidden',
		      'settings.pin': 'Pin to top',
		      'settings.unpin': 'Unpin',
		      'settings.moveUp': 'Move up',
		      'settings.moveDown': 'Move down',
		      'settings.noMatches': 'No models match your search.',
		      'settings.empty': 'No models available.',
		      'settings.refresh': 'Refresh providers',
		      'settings.refreshing': 'Refreshing…',
		      'settings.refreshed': 'Catalog refreshed: {models} models from {providers} providers.',
		      'settings.adopted': 'Discovered {count} models from {name} and added them to the catalog.',
		      'settings.synced': 'Discovered {count} new models from {name} and added them to the catalog.',
		      'settings.noNewModels': 'Checked {count} provider endpoint(s) — no new models to add.',
		      'settings.kickFailed': 'settings.yaml sync failed: {message} — file changes may not have taken effect.',
		      'settings.stale': '{name} is declared in settings but the running harness does not serve it — restart the harness to pick it up.',
		      'settings.discoverFailed': 'Could not discover models for {name}: {message}',
		      'settings.noDiscovered': 'The {name} endpoint answered with no models.',
		      'settings.refreshFailed': 'Refresh failed: {message}',
		    }
		    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-picker: dictionaries')
		
		    // ---- shared curation store (hidden map + pinned order), persisted
		    // durably through the harness settings document (namespace
		    // model-picker-augmented in settings.yaml) so pins and hidden models
		    // survive browser and machine restarts ----
		    const SETTINGS_NS = 'model-picker-augmented'
		    const connection = ctx.connection
		    let curationSnapshot = { hidden: {}, pinned: [] }
		    let curationTouched = false
		    const curationListeners = new Set()
		    const persist = (snapshot) => {
		      connection.api.settings.replace({ ns: SETTINGS_NS, section: { hidden: snapshot.hidden, pinned: snapshot.pinned } })
		        .then((response) => {
		          if (response && response.result && !response.result.ok) console.error('[msp] settings.replace rejected:', response.result.error)
		        }, (error) => {
		          console.error('[msp] settings.replace failed:', error && error.message ? error.message : error)
		        })
		    }
		    const curation = {
		      getSnapshot: () => curationSnapshot,
		      subscribe: (fn) => {
		        curationListeners.add(fn)
		        return () => { curationListeners.delete(fn) }
		      },
		      update: (mutate) => {
		        const next = { hidden: { ...curationSnapshot.hidden }, pinned: curationSnapshot.pinned.slice() }
		        mutate(next)
		        curationSnapshot = next
		        curationTouched = true
		        for (const fn of Array.from(curationListeners)) fn()
		        persist(next)
		      },
		      applySnapshot: (value) => {
		        if (curationTouched) return
		        curationSnapshot = {
		          hidden: value.hidden !== null && value.hidden !== undefined && typeof value.hidden === 'object' ? { ...value.hidden } : {},
		          pinned: Array.isArray(value.pinned) ? value.pinned.filter((k) => typeof k === 'string') : [],
		        }
		        for (const fn of Array.from(curationListeners)) fn()
		      },
		    }
		    const hydrate = () => {
		      connection.api.settings.describe({}).then((response) => {
		        if (!response.result.ok) return
		        const namespaces = response.result.value && response.result.value.namespaces
		        if (!Array.isArray(namespaces)) return
		        const ns = namespaces.find((n) => n.ns === SETTINGS_NS)
		        if (ns !== undefined && ns.value !== null && typeof ns.value === 'object') curation.applySnapshot(ns.value)
		      }, () => {})
		    }
		    hydrate()
		    const rowKey = (provider, model) => `${provider}/${model}`
		    const setHidden = (key, hidden) => curation.update((s) => { if (hidden) s.hidden[key] = true; else delete s.hidden[key] })
		    const togglePin = (key) => curation.update((s) => { const i = s.pinned.indexOf(key); if (i >= 0) s.pinned.splice(i, 1); else s.pinned.push(key) })
		    const movePin = (key, dir) => curation.update((s) => { const i = s.pinned.indexOf(key); const j = i + dir; if (i >= 0 && j >= 0 && j < s.pinned.length) { const k = s.pinned[i]; s.pinned[i] = s.pinned[j]; s.pinned[j] = k } })
		    // ---- catalog refresh: re-read the harness model catalog, and for
		    // active providers that currently serve no models, probe their
		    // endpoint (llm.discoverModels) and adopt the reply into the
		    // provider's settings models list, so a freshly declared provider
		    // needs only a Refresh click to appear in the composer picker ----
		    const DISCOVERY_DEFAULT_CONTEXT_WINDOW = 262144
		    const DISCOVERY_DEFAULT_MAX_TOKENS = 32768
		    const atPath = (value, path) => {
		      let node = value
		      for (const segment of path) {
		        if (node === null || node === undefined || typeof node !== 'object') return undefined
		        node = node[segment]
		      }
		      return node
		    }
		    const noteFor = (kind, name, extra) => ({ kind, name, ...extra })
		    const refreshModelCatalog = async () => {
		      // (0) force the host to re-read settings.yaml from disk. A no-op mutate on
		      // our own namespace triggers the file provider’s persistSection: the file is
		      // reconciled into the in-memory document (published, so file-added providers
		      // and models re-register live) and the file is rewritten atomically, which
		      // re-attaches the host’s file watcher if it went stale. Targeting our own
		      // namespace means no user-configured provider section is ever re-rendered.
		      let kickFailed = null
		      const kickResponse = await connection.api.settings.mutate({ ns: SETTINGS_NS, ops: [] }).catch((error) => {
		        kickFailed = (error !== null && error !== undefined && error.message) || String(error)
		        return null
		      })
		      if (kickResponse !== null && !kickResponse.result.ok) kickFailed = kickResponse.result.error.code + ': ' + kickResponse.result.error.message
		      const providersResponse = await connection.api.llm.providers({})
		      const catalogResponse = await connection.api.llm.models({})
		      if (!catalogResponse.result.ok) throw new Error(catalogResponse.result.error.code + ': ' + catalogResponse.result.error.message)
		      let groups = (catalogResponse.result.value.groups || []).slice()
		      const failures = (catalogResponse.result.value.failures || []).slice()
		      const notes = []
		      if (providersResponse.result.ok) {
		        const views = (providersResponse.result.value.providers || []).slice()
		        const describeResponse = await connection.api.settings.describe({})
		        if (describeResponse.result.ok) {
		          const namespaces = (describeResponse.result.value.namespaces || []).slice()
		          // (a) providers declared in settings that the running harness does not
		          // serve at all: the file kick above should have materialized them, so a
		          // stale entry here means the kick failed or the profile is not serviceable —
		          // surface a hint instead
		          const servedIds = new Set(views.map((view) => view.provider))
		          for (const nsView of namespaces) {
		            const declared = atPath(nsView.value, ['providers'])
		            if (declared === null || declared === undefined || typeof declared !== 'object' || Array.isArray(declared)) continue
		            for (const [id, profile] of Object.entries(declared)) {
		              if (profile === null || profile === undefined || typeof profile !== 'object') continue
		              if (servedIds.has(id)) continue
		              notes.push(noteFor('stale', typeof profile.displayName === 'string' && profile.displayName.length > 0 ? profile.displayName : id))
		            }
		          }
		          // (b) reconcile each active provider's configured models against the live
		          // catalog. A provider that declares no models in settings but points at a
		          // baseURL gets endpoint discovery, and the reply is adopted as its
		          // configured list. A provider that does declare models is never shrunk or
		          // rewritten: if the harness is not serving them yet (e.g. declared while
		          // the harness was running), a restart hint is surfaced instead; otherwise
		          // the endpoint's current catalog is fetched and any models the list lacks
		          // are appended, so newly announced models reach the picker without manual
		          // YAML edits. The catalog group size is not a reliable signal — the
		          // harness can serve placeholder entries for model-less providers — so the
		          // configured list in settings is the source of truth.
		            let endpointsChecked = 0
		            let changedSomething = false
		          for (const view of views.filter((view) => view.active !== false && view.settingsNs !== undefined)) {
		            const nsView = namespaces.find((n) => n.ns === view.settingsNs)
		            if (nsView === undefined) continue
		            const profile = atPath(nsView.value, view.settingsPath)
		            if (profile === null || profile === undefined || typeof profile !== 'object') continue
		            const configured = Array.isArray(profile.models) ? profile.models : []
		            if (configured.length > 0) {
		              // A configured provider must actually be served — a placeholder entry is
		              // not its real list. If it is not, a restart is the fix and syncing its
		              // endpoint would be wasted work.
		              const group = groups.find((g) => g.id === view.provider)
		              const servesRealModels = group !== undefined && group.models.length > 0 && group.models.some((m) => m !== null && m !== undefined && m.id !== view.provider)
		              if (!servesRealModels) { notes.push(noteFor('stale', view.displayName)); continue }
		            }
		            const baseURL = typeof profile.baseURL === 'string' ? profile.baseURL : ''
		            if (baseURL.length === 0) continue
		            endpointsChecked += 1
		            const discoverResponse = await connection.api.llm.discoverModels({
		              settingsNs: view.settingsNs,
		              provider: view.provider,
		              baseURL,
		              ...(typeof profile.api === 'string' && profile.api.length > 0 ? { api: profile.api } : {}),
		            })
		            if (!discoverResponse.result.ok) {
		              notes.push(noteFor('discoverFailed', view.displayName, { message: discoverResponse.result.error.code + ': ' + discoverResponse.result.error.message }))
		              continue
		            }
		            const existingIds = new Set(configured.map((m) => m && m.id).filter((id) => typeof id === 'string'))
		            const entries = (discoverResponse.result.value.models || [])
		              .filter((m) => m !== null && m !== undefined && typeof m.id === 'string' && m.id.length > 0 && !existingIds.has(m.id))
		              .map((m) => ({
		                id: m.id,
		                name: typeof m.name === 'string' && m.name.length > 0 ? m.name : m.id,
		                contextWindow: typeof m.contextWindow === 'number' && Number.isFinite(m.contextWindow) && m.contextWindow > 0 ? Math.floor(m.contextWindow) : DISCOVERY_DEFAULT_CONTEXT_WINDOW,
		                maxTokens: typeof m.maxTokens === 'number' && Number.isFinite(m.maxTokens) && m.maxTokens > 0 ? Math.floor(m.maxTokens) : DISCOVERY_DEFAULT_MAX_TOKENS,
		              }))
		            if (entries.length === 0) {
		              if (configured.length === 0) notes.push(noteFor('noDiscovered', view.displayName))
		              continue
		            }
		            // Model-less: adopt the reply as the full list. Configured: append,
		            // leaving every existing entry untouched.
		            const nextModels = configured.length === 0 ? entries : configured.concat(entries)
		            const mutateResponse = await connection.api.settings.mutate({
		              ns: view.settingsNs,
		              ops: [{ op: 'set', path: view.settingsPath.concat(['models']), value: nextModels }],
		              expectedRevision: nsView.revision,
		            })
		            if (!mutateResponse.result.ok) {
		              notes.push(noteFor('discoverFailed', view.displayName, { message: mutateResponse.result.error.code + ': ' + mutateResponse.result.error.message }))
		              continue
		            }
		            // Chain the revision so a second provider in the same namespace can write too.
		            nsView.revision = mutateResponse.result.value.revision
		            changedSomething = true
		            notes.push(configured.length === 0 ? noteFor('adopted', view.displayName, { count: entries.length }) : noteFor('synced', view.displayName, { count: entries.length }))
		          }
		            if (endpointsChecked > 0 && !changedSomething) notes.push(noteFor('noNewModels', null, { count: endpointsChecked }))
		        }
		      }
		      if (notes.some((note) => note.kind === 'adopted' || note.kind === 'synced')) {
		        const reloaded = await connection.api.llm.models({})
		        if (reloaded.result.ok) {
		          groups = (reloaded.result.value.groups || []).slice()
		        }
		      }
		      if (kickFailed !== null) notes.push(noteFor('kickFailed', null, { message: kickFailed }))
		      const totalModels = groups.reduce((sum, group) => sum + group.models.length, 0)
		      return { groups, failures, notes, providers: groups.length, models: totalModels }
		    }
		
		    // ---- package styles ----
		    const css = `
		.msp-root{min-width:0;position:relative}
		.msp-trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:transparent;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex;font-family:inherit}
		.msp-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
		.msp-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
		.msp-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
		.msp-triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
		.msp-triggerEffort{color:var(--dsw-alias-label-caption);flex:none}
		.msp-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s;display:inline-flex}
		.msp-chevronOpen{transform:rotate(180deg)}
		.msp-menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden;font-family:inherit}
		.msp-status,.msp-empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}
		.msp-error,.msp-warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}
		.msp-warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}
		.msp-retry{color:inherit;font:inherit;cursor:pointer;background:none;border:none;border-radius:6px;padding:0 4px;font-size:12px;line-height:18px;flex:none}
		.msp-retry:hover{background:var(--dsw-alias-interactive-bg-hover)}
		.msp-groups{overflow-y:auto;overscroll-behavior:contain}
		.msp-group{flex-direction:column;display:flex}
		.msp-groupTitle{color:var(--dsw-alias-label-caption);padding:6px 8px 2px;font-size:12px;font-weight:500;line-height:16px}
		.msp-option{box-sizing:border-box;border:none;background:none;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;align-items:center;gap:8px;padding:6px 8px;font-size:13px;line-height:20px;display:flex;width:100%;text-align:left;font-family:inherit}
		.msp-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
		.msp-option:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}
		.msp-option:disabled{opacity:.6;cursor:default}
		.msp-optionCopy{min-width:0;flex:1;flex-direction:column;display:flex}
		.msp-modelName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.msp-description{color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:16px}
		.msp-check{color:var(--dsw-alias-brand-primary);flex:none;width:16px;justify-content:center;align-items:center;display:flex}
		.msp-selected{background:var(--dsw-alias-interactive-bg-hover)}
		.msp-cell{box-sizing:border-box;width:100%;border:none;background:none;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;align-items:center;gap:8px;padding:6px 8px;font-size:13px;line-height:20px;display:flex;text-align:left;font-family:inherit}
		.msp-cell:hover{background:var(--dsw-alias-interactive-bg-hover)}
		.msp-cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}
		.msp-cellLabel{color:var(--dsw-alias-label-primary)}
		.msp-cellValue{color:var(--dsw-alias-label-tertiary);min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.msp-cellChevron{color:var(--dsw-alias-label-caption);flex:none;display:inline-flex}
		.msp-search{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:30px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:8px;margin-bottom:4px;padding:0 8px;font-size:13px;line-height:20px;display:flex;align-items:center;gap:6px;flex:none;font-family:inherit}
		.msp-search:focus-within{border-color:var(--dsw-alias-brand-primary)}
		.msp-searchIcon{color:var(--dsw-alias-label-caption);flex:none;display:inline-flex}
		.msp-searchInput{box-sizing:border-box;border:none;outline:none;background:transparent;color:inherit;min-width:0;flex:1;font:inherit;padding:0}
		.msp-searchInput::placeholder{color:var(--dsw-alias-label-dimmed)}
		.msp-searchClear{box-sizing:border-box;border:none;background:none;color:var(--dsw-alias-label-tertiary);cursor:pointer;border-radius:6px;padding:2px;flex:none;display:inline-flex}
		.msp-searchClear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
		.msp-toast{position:absolute;top:calc(100% + 6px);right:0;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-state-error-primary);border-radius:8px;padding:6px 10px;font-size:12px;line-height:18px;box-shadow:var(--dsw-shadow-lv3);z-index:30;max-width:280px}
		.msp-section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex;font-family:inherit}
		.msp-title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}
		.msp-intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}
		.msp-pkgName{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px;font-family:var(--ds-font-family-code)}
		.msp-bar{align-items:center;gap:8px;display:flex}
		.msp-pageSearch{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);height:32px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:0 10px;font-size:14px;line-height:22px;flex:1;min-width:0;font-family:inherit}
		.msp-pageSearch:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
		.msp-pageSearch::placeholder{color:var(--dsw-alias-label-dimmed)}
		.msp-reset{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);height:32px;color:var(--dsw-alias-label-primary);cursor:pointer;background:none;border-radius:16px;padding:0 12px;font-size:13px;line-height:20px;flex:none;font-family:inherit}
		.msp-reset:hover{background:var(--dsw-alias-interactive-bg-hover)}
		.msp-cards{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}
		.msp-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;gap:8px;padding:10px 12px;display:flex}
		.msp-cardHead{align-items:center;gap:8px;display:flex;flex-wrap:wrap}
		.msp-cardName{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:22px}
		.msp-cardTag{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;padding:1px 6px;font-size:11px;line-height:16px}
		.msp-cardDesc{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
		.msp-chip{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:none;border-radius:13px;align-items:center;gap:4px;padding:0 8px;font-size:12px;line-height:18px;display:inline-flex;font-family:inherit}
		.msp-chip:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
		.msp-chipOn{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
		.msp-chip:disabled{opacity:.5;cursor:default}
		.msp-iconBtn{box-sizing:border-box;width:26px;height:26px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:none;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex;font-family:inherit}
		.msp-iconBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
		.msp-iconBtn:disabled{opacity:.35;cursor:default}
		.msp-note{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}
		.msp-noteError{color:var(--dsw-alias-state-error-primary)}
		.msp-noteRow{align-items:center;gap:8px;display:flex}
		.msp-reset:disabled{color:var(--dsw-alias-label-dimmed);cursor:default;opacity:.7}
		.msp-noteWarn{color:var(--dsw-alias-state-warn-label)}
		`;
		const STYLE_TAG = "dsh-model-picker-augmented/styles.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + STYLE_TAG + "\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.pluginCss = STYLE_TAG;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		
		    // ---- tiny inline icons ----
		    const svgIcon = (children, size) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true }, children)
		    const strokePath = (d) => React.createElement('path', { d, stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })
		    const chevronDown = (size) => svgIcon(strokePath('M4 6l4 4 4-4'), size)
		    const chevronRight = (size) => svgIcon(strokePath('M6 4l4 4-4 4'), size)
		    const chevronUp = (size) => svgIcon(strokePath('M4 10l4-4 4 4'), size)
		    const checkIcon = (size) => svgIcon(strokePath('M3 8.5l3.2 3L13 5'), size)
		    const closeIcon = (size) => svgIcon(React.createElement('path', { d: 'M4 4l8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }), size)
		    const searchIcon = (size) => svgIcon([React.createElement('circle', { cx: 7, cy: 7, r: 4, stroke: 'currentColor', strokeWidth: 1.5 }), strokePath('M10.5 10.5l3 3')], size)
		    const pinIcon = (size, filled) => svgIcon(React.createElement('path', { d: 'M5 2h6v10.5L8 10.4l-3 2.1z', stroke: filled ? 'none' : 'currentColor', fill: filled ? 'currentColor' : 'none', strokeWidth: 1.5, strokeLinejoin: 'round' }), size)
		
		    // ---- timer helper for toast auto-dismiss (ctx.timeout, fiber-owned) ----
		    const timeout = (fn, ms) => ctx.timeout(fn, ms)
		
		    // ---- composer model seat: searchable + curated picker ----
		    function SearchableModelSelect({ locked, available, directory, load, select, t }) {
		      const state = React.useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot())
		      const curated = React.useSyncExternalStore(curation.subscribe, curation.getSnapshot)
		      const [open, setOpen] = React.useState(false)
		      const [pane, setPane] = React.useState('root')
		      const [query, setQuery] = React.useState('')
		      const lastActionRef = React.useRef('load')
		      const [toast, setToast] = React.useState(null)
		      const toastSeq = React.useRef(0)
		      const rootRef = React.useRef(null)
		      const triggerRef = React.useRef(null)
		      const searchRef = React.useRef(null)
		      const itemRefs = React.useRef([])
		      const id = React.useId()
		
		      const choices = React.useMemo(() => state.groups.flatMap((group) => group.models.map((model) => ({
		        group,
		        model,
		        selection: {
		          provider: group.id,
		          model: model.id,
		          ...(model.reasoning !== undefined && model.reasoning.defaultEffort !== undefined ? { reasoningEffort: model.reasoning.defaultEffort } : {}),
		        },
		      }))), [state.groups])
		      const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current.provider && c.selection.model === state.current.model)]
		      const reasoning = currentChoice === undefined ? undefined : currentChoice.model.reasoning
		      const effectiveEffort = (state.current !== null && state.current.reasoningEffort !== undefined ? state.current.reasoningEffort : undefined) ?? (reasoning === undefined ? undefined : reasoning.defaultEffort)
		      const effortLabel = reasoning === undefined ? undefined : effectiveEffort === undefined ? t('effort.providerDefault') : (reasoning.efforts.find((level) => level.id === effectiveEffort) || {}).name || effectiveEffort
		      const effortChoices = React.useMemo(() => reasoning === undefined ? [] : [
		        ...(reasoning.defaultEffort === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : []),
		        ...reasoning.efforts.map((effort) => ({
		          key: `effort:${effort.id}`,
		          effort: effort.id,
		          label: effort.name,
		          ...(effort.description === undefined ? {} : { description: effort.description }),
		        })),
		      ], [reasoning, t])
		      const busy = state.status === 'selecting'
		      const reload = () => { lastActionRef.current = 'load'; load() }
		
		      React.useEffect(() => {
		        if (available) { lastActionRef.current = 'load'; load() }
		      }, [available, load])
		      React.useEffect(() => {
		        if (!open) return
		        const closeOutside = (event) => { if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false) }
		        document.addEventListener('mousedown', closeOutside)
		        return () => document.removeEventListener('mousedown', closeOutside)
		      }, [open])
		      React.useEffect(() => {
		        if (open && pane === 'model' && searchRef.current !== null) searchRef.current.focus()
		      }, [open, pane])
		      React.useEffect(() => {
		        if (toast === null) return
		        return timeout(() => setToast(null), 4000)
		      }, [toast])
		
		      if (!available) return null
		
		      const show = () => { setPane('root'); setQuery(''); setOpen(true); reload() }
		      const close = (restoreFocus) => {
		        setOpen(false); setPane('root'); setQuery('')
		        if (restoreFocus) queueMicrotask(() => { if (triggerRef.current !== null) triggerRef.current.focus() })
		      }
		      const moveFocus = (offset) => {
		        const items = itemRefs.current.filter((item) => item !== null)
		        if (items.length === 0) return
		        const active = items.findIndex((item) => item === document.activeElement)
		        const next = (Math.max(active, 0) + offset + items.length) % items.length
		        if (items[next] !== undefined) items[next].focus()
		      }
		      const onRootKeyDown = (event) => {
		        if (event.key === 'Escape' && open) {
		          event.preventDefault()
		          if (pane !== 'root') { setPane('root'); return }
		          close(true)
		          return
		        }
		        if (!open) return
		        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		          event.preventDefault()
		          moveFocus(event.key === 'ArrowDown' ? 1 : -1)
		        }
		      }
		      const onBlur = (event) => {
		        if (event.relatedTarget instanceof Node && rootRef.current !== null && rootRef.current.contains(event.relatedTarget)) return
		        close()
		      }
		      const settleSelection = (accepted) => {
		        if (accepted) { if (rootRef.current !== null) close(true); return }
		        const message = directory.getSnapshot().error
		        if (message !== null) {
		          toastSeq.current += 1
		          setToast({ seq: toastSeq.current, text: t('error.action', { message }) })
		        }
		      }
		      const choose = (selection) => {
		        if (state.current !== null && state.current.provider === selection.provider && state.current.model === selection.model) { close(true); return }
		        lastActionRef.current = 'select'
		        select(selection).then(settleSelection)
		      }
		      const chooseEffort = (effort) => {
		        if (state.current === null) return
		        if (effectiveEffort === effort) { close(true); return }
		        const selection = { provider: state.current.provider, model: state.current.model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }
		        lastActionRef.current = 'select'
		        select(selection).then(settleSelection)
		      }
		
		      const modelLabel = currentChoice === undefined ? t('trigger.fallback') : currentChoice.model.name
		      const triggerLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`
		      const triggerAria = currentChoice === undefined ? t('trigger.selectAria') : effortLabel === undefined ? t('trigger.aria', { model: modelLabel }) : t('trigger.ariaEffort', { model: modelLabel, effort: effortLabel })
		
		      // curated + filtered view of the model list
		      const curatedView = (() => {
		        const hidden = curated.hidden
		        const byKey = new Map()
		        for (const group of state.groups) for (const model of group.models) byKey.set(rowKey(group.id, model.id), { group, model })
		        const pinned = []
		        const pinnedSet = new Set()
		        for (const key of curated.pinned) {
		          const entry = byKey.get(key)
		          if (entry !== undefined && !hidden[key]) { pinned.push(entry); pinnedSet.add(key) }
		        }
		        const q = query.trim().toLowerCase()
		        const match = (text) => q.length === 0 || text.toLowerCase().includes(q)
		        const pinnedVisible = pinned.filter(({ group, model }) => match(model.name) || match(group.name))
		        const groups = []
		        for (const group of state.groups) {
		          const models = group.models.filter((model) => {
		            const key = rowKey(group.id, model.id)
		            if (hidden[key] || pinnedSet.has(key)) return false
		            return match(model.name) || match(group.name)
		          })
		          if (models.length > 0) groups.push({ group, models })
		        }
		        return { pinned: pinnedVisible, groups }
		      })()
		
		      itemRefs.current = []
		      let itemIndex = 0
		      const itemRef = () => { const at = itemIndex++; return (node) => { itemRefs.current[at] = node } }
		      const isSelected = (group, model) => state.current !== null && state.current.provider === group.id && state.current.model === model.id
		      const optionButton = (group, model, ref) => {
		        const selected = isSelected(group, model)
		        return React.createElement('button', {
		          key: rowKey(group.id, model.id),
		          ref,
		          type: 'button',
		          role: 'menuitemradio',
		          'aria-checked': selected,
		          className: 'msp-option' + (selected ? ' msp-selected' : ''),
		          title: model.name,
		          disabled: busy,
		          onClick: () => choose({ provider: group.id, model: model.id }),
		        },
		          React.createElement('span', { className: 'msp-optionCopy' },
		            React.createElement('span', { className: 'msp-modelName' }, model.name),
		            model.description !== undefined && React.createElement('span', { className: 'msp-description' }, model.description),
		          ),
		          React.createElement('span', { className: 'msp-check' }, selected ? checkIcon(14) : null),
		        )
		      }
		
		      const loadErrorStrip = state.error !== null && lastActionRef.current === 'load'
		        ? React.createElement('div', { className: 'msp-error' },
		            React.createElement('span', null, t('error.action', { message: state.error })),
		            React.createElement('button', { type: 'button', className: 'msp-retry', onClick: reload }, t('retry')),
		          )
		        : null
		
		      let modelPaneBody = null
		      if (state.status === 'loading') {
		        modelPaneBody = React.createElement('div', { className: 'msp-status' }, t('status.loading'))
		      } else if (state.status === 'ready' && state.groups.length === 0) {
		        modelPaneBody = React.createElement('div', { className: 'msp-empty' }, t('empty.models'))
		      } else if (state.status === 'ready' && state.groups.length > 0) {
		        if (curatedView.pinned.length === 0 && curatedView.groups.length === 0) {
		          modelPaneBody = React.createElement('div', { className: 'msp-empty' }, query.trim().length > 0 ? t('search.noResults') : t('empty.curated'))
		        } else {
		          modelPaneBody = React.createElement('div', { className: 'msp-groups scrollable' },
		            curatedView.pinned.length > 0 && React.createElement('section', { role: 'group', 'aria-label': t('search.pinned'), className: 'msp-group' },
		              React.createElement('div', { className: 'msp-groupTitle' }, t('search.pinned')),
		              curatedView.pinned.map(({ group, model }) => optionButton(group, model, itemRef())),
		            ),
		            curatedView.groups.map(({ group, models }) => {
		              const headingId = `${id}-${group.id}`
		              return React.createElement('section', { role: 'group', 'aria-labelledby': headingId, className: 'msp-group', key: group.id },
		                React.createElement('div', { className: 'msp-groupTitle', id: headingId }, group.name),
		                models.map((model) => optionButton(group, model, itemRef())),
		              )
		            }),
		          )
		        }
		      }
		
		      const rootPane = React.createElement(React.Fragment, null,
		        React.createElement('button', { ref: itemRef(), type: 'button', role: 'menuitem', className: 'msp-cell', onClick: () => setPane('model') },
		          React.createElement('span', { className: 'msp-cellLabel' }, t('menu.model')),
		          React.createElement('span', { className: 'msp-cellValue' }, modelLabel),
		          React.createElement('span', { className: 'msp-cellChevron' }, chevronRight(14)),
		        ),
		        reasoning !== undefined && React.createElement('button', { ref: itemRef(), type: 'button', role: 'menuitem', className: 'msp-cell', onClick: () => setPane('effort') },
		          React.createElement('span', { className: 'msp-cellLabel' }, t('menu.effort')),
		          React.createElement('span', { className: 'msp-cellValue' }, effortLabel),
		          React.createElement('span', { className: 'msp-cellChevron' }, chevronRight(14)),
		        ),
		      )
		
		      const modelPane = React.createElement(React.Fragment, null,
		        loadErrorStrip,
		        state.failures.map((failure) => React.createElement('div', { className: 'msp-warning', key: failure.id },
		          React.createElement('span', null, t('warning.groupLoad', { name: failure.name, message: failure.message })),
		          React.createElement('button', { type: 'button', className: 'msp-retry', onClick: reload }, t('retry')),
		        )),
		        React.createElement('div', { className: 'msp-search' },
		          React.createElement('span', { className: 'msp-searchIcon' }, searchIcon(13)),
		          React.createElement('input', {
		            ref: searchRef,
		            className: 'msp-searchInput',
		            type: 'text',
		            value: query,
		            placeholder: t('search.placeholder'),
		            'aria-label': t('search.placeholder'),
		            onChange: (event) => setQuery(event.target.value),
		            onKeyDown: (event) => {
		              if (event.key === 'Escape' && query.length > 0) { event.preventDefault(); event.stopPropagation(); setQuery('') }
		            },
		          }),
		          query.length > 0 && React.createElement('button', { type: 'button', className: 'msp-searchClear', 'aria-label': t('search.clear'), onClick: () => setQuery('') }, closeIcon(12)),
		        ),
		        modelPaneBody,
		      )
		
		      const effortPane = React.createElement(React.Fragment, null,
		        loadErrorStrip,
		        effortChoices.length === 0 ? React.createElement('div', { className: 'msp-empty' }, t('empty.efforts'))
		        : effortChoices.map((level) => React.createElement('button', { key: level.key, ref: itemRef(), type: 'button', role: 'menuitemradio', 'aria-checked': effectiveEffort === level.effort, className: 'msp-option' + (effectiveEffort === level.effort ? ' msp-selected' : ''), disabled: busy, onClick: () => chooseEffort(level.effort) },
		            React.createElement('span', { className: 'msp-optionCopy' },
		              React.createElement('span', { className: 'msp-modelName' }, level.label),
		              level.description !== undefined && React.createElement('span', { className: 'msp-description' }, level.description),
		            ),
		            React.createElement('span', { className: 'msp-check' }, effectiveEffort === level.effort ? checkIcon(14) : null),
		          )),
		      )
		
		      return React.createElement('div', { ref: rootRef, className: 'msp-root', onKeyDown: onRootKeyDown, onBlur },
		        React.createElement('button', {
		          ref: triggerRef,
		          type: 'button',
		          className: 'msp-trigger',
		          'aria-label': triggerAria,
		          'aria-haspopup': 'menu',
		          'aria-expanded': open,
		          'aria-controls': open ? `${id}-menu` : undefined,
		          title: triggerLabel,
		          disabled: locked,
		          onClick: () => { if (open) close(); else show() },
		        },
		          React.createElement('span', { className: 'msp-triggerLabel' }, modelLabel),
		          effortLabel !== undefined && React.createElement('span', { className: 'msp-triggerEffort' }, effortLabel),
		          React.createElement('span', { className: 'msp-chevron' + (open ? ' msp-chevronOpen' : '') }, chevronDown(14)),
		        ),
		        open && React.createElement('div', { id: `${id}-menu`, className: 'msp-menu', role: 'menu', 'aria-label': t('menu.aria'), 'aria-busy': state.status === 'loading' || busy },
		          pane === 'root' && rootPane,
		          pane === 'model' && modelPane,
		          pane === 'effort' && effortPane,
		        ),
		        toast !== null && React.createElement('div', { key: toast.seq, className: 'msp-toast', role: 'status' }, toast.text),
		      )
		    }
		
		    // ---- settings page: curation editor ----
		    function CurationPage({ t }) {
		      const curated = React.useSyncExternalStore(curation.subscribe, curation.getSnapshot)
		      const [attempt, setAttempt] = React.useState(0)
		      const [catalog, setCatalog] = React.useState(null)
		      const [query, setQuery] = React.useState('')
		      const [refresh, setRefresh] = React.useState(null)
		      const refreshingRef = React.useRef(false)
		      const refreshSeq = React.useRef(0)
		      const refreshing = refresh !== null && refresh.busy === true
		      React.useEffect(() => {
		        let alive = true
		        setCatalog(null)
		        refreshSeq.current += 1
		        const seq = refreshSeq.current
		        connection.api.llm.models({}).then((response) => {
		          if (!alive || seq !== refreshSeq.current) return
		          if (response.result.ok) setCatalog({ groups: response.result.value.groups, failures: response.result.value.failures || [] })
		          else setCatalog({ error: response.result.error.code + ': ' + response.result.error.message })
		        }, (error) => {
		          if (!alive) return
		          setCatalog({ error: String((error !== null && error !== undefined && error.message) || error) })
		        })
		        return () => { alive = false }
		      }, [attempt])
		      const retry = () => setAttempt((n) => n + 1)
		      // explicit Refresh: first force the host to re-read settings.yaml
		      // from disk (file-added providers/models re-register live), then
		      // re-read the harness catalog, and for active providers that serve
		      // no models, discover them from their endpoint and adopt the reply
		      // into the provider's settings
		      const doRefresh = () => {
		        if (refreshingRef.current) return
		        refreshingRef.current = true
		        refreshSeq.current += 1
		        const seq = refreshSeq.current
		        setRefresh({ busy: true })
		        refreshModelCatalog().then((outcome) => {
		          if (seq !== refreshSeq.current) return
		          setCatalog({ groups: outcome.groups, failures: outcome.failures })
		          setRefresh({
		            providers: outcome.providers,
		            models: outcome.models,
		            warnings: outcome.notes.map((note) => {
		              if (note.kind === 'adopted') return { key: 'adopted-' + note.name, text: t('settings.adopted', { count: note.count, name: note.name }) }
		              if (note.kind === 'synced') return { key: 'synced-' + note.name, text: t('settings.synced', { count: note.count, name: note.name }) }
		              if (note.kind === 'noNewModels') return { key: 'noNewModels', text: t('settings.noNewModels', { count: note.count }) }
		              if (note.kind === 'kickFailed') return { key: 'kickFailed', text: t('settings.kickFailed', { message: note.message }) }
		              if (note.kind === 'stale') return { key: 'stale-' + note.name, text: t('settings.stale', { name: note.name }) }
		              if (note.kind === 'noDiscovered') return { key: 'noDiscovered-' + note.name, text: t('settings.noDiscovered', { name: note.name }) }
		              return { key: 'discoverFailed-' + note.name, text: t('settings.discoverFailed', { name: note.name, message: note.message }) }
		            }),
		          })
		        }, (error) => {
		          if (seq !== refreshSeq.current) return
		          setRefresh({ failed: String((error !== null && error !== undefined && error.message) || error) })
		        }).finally(() => {
		          if (seq !== refreshSeq.current) return
		          refreshingRef.current = false
		        })
		      }
		      // read-only display refresh: the page follows harness catalog
		      // changes pushed from the host (settings commits, adapter
		      // re-registrations, credential updates), mirroring the shipped
		      // Settings → Models page — no settings are written on events
		      React.useEffect(() => {
		        let timer = null
		        const invalidate = () => {
		          if (refreshingRef.current) return
		          if (timer !== null) clearTimeout(timer)
		          timer = setTimeout(() => {
		            timer = null
		            refreshSeq.current += 1
		            const seq = refreshSeq.current
		            connection.api.llm.models({}).then((response) => {
		              if (seq !== refreshSeq.current) return
		              if (response.result.ok) setCatalog({ groups: response.result.value.groups, failures: response.result.value.failures || [] })
		            }, () => {})
		          }, 250)
		        }
		        const disposers = [
		          ctx.remote.$on('llm/adapters-updated', invalidate),
		          ctx.remote.$on('settings/document-updated', invalidate),
		          ctx.remote.$on('credentials/reference-updated', invalidate),
		        ]
		        return () => {
		          if (timer !== null) clearTimeout(timer)
		          for (const dispose of disposers) dispose()
		        }
		      }, [])
		      const q = query.trim().toLowerCase()
		      const match = (text) => q.length === 0 || text.toLowerCase().includes(q)
		
		      const byKey = new Map()
		      const groups = (catalog !== null && catalog.groups !== undefined) ? catalog.groups : []
		      for (const group of groups) for (const model of group.models) byKey.set(rowKey(group.id, model.id), { group, model })
		
		      const pinnedRows = []
		      const pinnedSet = new Set()
		      for (const key of curated.pinned) {
		        const entry = byKey.get(key)
		        if (entry !== undefined && (match(entry.model.name) || match(entry.group.name))) pinnedRows.push({ key, ...entry })
		        pinnedSet.add(key)
		      }
		      const remainingGroups = groups
		        .map((group) => ({ group, models: group.models.filter((model) => {
		          const key = rowKey(group.id, model.id)
		          if (pinnedSet.has(key)) return false
		          return match(model.name) || match(group.name)
		        }) }))
		        .filter(({ models }) => models.length > 0)
		
		      const card = (key, group, model, pinned) => {
		        const hidden = curated.hidden[key] === true
		        const idx = curated.pinned.indexOf(key)
		        return React.createElement('li', { className: 'msp-card', key },
		          React.createElement('div', { className: 'msp-cardHead' },
		            React.createElement('span', { className: 'msp-cardName', title: model.name }, model.name),
		            React.createElement('span', { className: 'msp-cardTag' }, group.name),
		            React.createElement('button', { className: 'msp-chip' + (hidden ? '' : ' msp-chipOn'), type: 'button', 'aria-pressed': !hidden, onClick: () => setHidden(key, !hidden) },
		              hidden ? t('settings.hidden') : t('settings.visible'),
		            ),
		            React.createElement('button', { className: 'msp-chip' + (pinned ? ' msp-chipOn' : ''), type: 'button', onClick: () => togglePin(key) },
		              pinned ? t('settings.unpin') : t('settings.pin'),
		            ),
		            pinned && React.createElement('button', { className: 'msp-iconBtn', type: 'button', 'aria-label': t('settings.moveUp'), disabled: idx <= 0, onClick: () => movePin(key, -1) }, chevronUp(14)),
		            pinned && React.createElement('button', { className: 'msp-iconBtn', type: 'button', 'aria-label': t('settings.moveDown'), disabled: idx >= curated.pinned.length - 1, onClick: () => movePin(key, 1) }, chevronDown(14)),
		          ),
		          model.description !== undefined && React.createElement('p', { className: 'msp-cardDesc' }, model.description),
		        )
		      }
		
		      return React.createElement('section', { className: 'msp-section', 'aria-label': t('settings.title') },
		        React.createElement('h2', { className: 'msp-title' }, t('settings.title')),
		        React.createElement('p', { className: 'msp-pkgName' }, name),
		        React.createElement('p', { className: 'msp-intro' }, t('settings.intro')),
		        React.createElement('div', { className: 'msp-bar' },
		          React.createElement('input', { className: 'msp-pageSearch', type: 'text', placeholder: t('settings.searchPlaceholder'), 'aria-label': t('settings.searchPlaceholder'), value: query, onChange: (event) => setQuery(event.target.value) }),
		          React.createElement('button', { className: 'msp-reset', type: 'button', disabled: refreshing, 'aria-busy': refreshing, onClick: doRefresh }, refreshing ? t('settings.refreshing') : t('settings.refresh')),
		        ),
		        catalog === null && React.createElement('p', { className: 'msp-note' }, t('settings.loading')),
		        catalog !== null && catalog.error !== undefined && React.createElement('div', { className: 'msp-noteRow' },
		          React.createElement('p', { className: 'msp-note msp-noteError' }, t('settings.loadError', { message: catalog.error })),
		          React.createElement('button', { className: 'msp-chip', type: 'button', onClick: retry }, t('settings.retry')),
		        ),
		        refresh !== null && (refreshing
		          ? React.createElement('p', { className: 'msp-note', role: 'status' }, t('settings.refreshing'))
		          : refresh.failed !== undefined
		            ? React.createElement('p', { className: 'msp-note msp-noteError', role: 'status' }, t('settings.refreshFailed', { message: refresh.failed }))
		            : React.createElement('div', { role: 'status' },
		                React.createElement('p', { className: 'msp-note' }, t('settings.refreshed', { providers: refresh.providers, models: refresh.models })),
		                (refresh.warnings || []).map((warning) => React.createElement('p', { key: warning.key, className: 'msp-note msp-noteWarn' }, warning.text)),
		              )),
		        catalog !== null && catalog.error === undefined && (catalog.failures || []).length > 0 && React.createElement('div', null,
		          (catalog.failures || []).map((failure) => React.createElement('p', { key: failure.id, className: 'msp-note msp-noteWarn' }, t('warning.groupLoad', { name: failure.name, message: failure.message }))),
		        ),
		        catalog !== null && catalog.error === undefined && (pinnedRows.length === 0 && remainingGroups.length === 0
		          ? React.createElement('p', { className: 'msp-note' }, q.length > 0 ? t('settings.noMatches') : t('settings.empty'))
		          : React.createElement(React.Fragment, null,
		              pinnedRows.length > 0 && React.createElement(React.Fragment, null,
		                React.createElement('p', { className: 'msp-note' }, t('settings.pinned')),
		                React.createElement('ul', { className: 'msp-cards' }, pinnedRows.map(({ key, group, model }) => card(key, group, model, true))),
		              ),
		              remainingGroups.map(({ group, models }) => React.createElement('div', { key: group.id },
		                React.createElement('p', { className: 'msp-note' }, group.name),
		                React.createElement('ul', { className: 'msp-cards' }, models.map((model) => card(rowKey(group.id, model.id), group, model, false))),
		              )),
		            )),
		      )
		    }
		
		    // ---- registrations ----
		    const t = ctx.locale.bind(NS)
		    ctx.slots.inject('settings.section', () => ctx.slots.register({
		      name: 'settings.section',
		      id: 'model-picker-augmented',
		      order: 100,
		      label: () => t('settings.title'),
		      locale: NS,
		    }, CurationPage))
		    ctx.slots.inject('conversation.input.model', () => ctx.slots.register({
		      name: 'conversation.input.model',
		      priority: -1,
		      locale: NS,
		      inject: (sessionId) => {
		        const models = ctx.modelDirectories
		        const sessions = ctx.sessions
		        const directory = models.directoryFor(sessionId)
		        const available = sessions.subagentAddress(sessionId) === undefined
		        return {
		          available,
		          directory: directory.store,
		          load: () => { if (available) directory.load().catch(() => {}) },
		          select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false),
		        }
		      },
		    }, SearchableModelSelect))
		  }

		const name = "dsh-model-picker-augmented";
		exports.name = name;
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
