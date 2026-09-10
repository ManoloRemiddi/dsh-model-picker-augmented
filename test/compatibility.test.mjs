// MIT License — Copyright (c) 2026 Manolo Remiddi.
// SPDX-License-Identifier: MIT. See LICENSE for the full license text.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

async function mount({ catalogError } = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const writes = [], discoveries = [], registrations = new Map(), effects = []
  let stored = { hidden: {}, pinned: ['local/qwen'] }
  const models = [{ id: 'qwen', name: 'Qwen' }]
  const ok = value => ({ ok: true, value })
  const ctx = {
    locale: { register: () => () => {}, bind: () => key => key },
    effect: fn => { const dispose = fn(); effects.push(dispose); return dispose },
    timeout: (fn, ms) => setTimeout(fn, ms),
    slots: { inject: (_name, fn) => fn(), register: (spec, component) => { registrations.set(spec.name, { spec, component }); return () => {} } },
    remote: {
      $on: () => () => {},
      settings: {
        describe: async (...args) => {
          assert.equal(args.length, 0)
          return ok({ namespaces: [
            { ns: 'model-picker-augmented', revision: 1, value: stored },
            { ns: 'models', revision: 3, value: { providers: { local: { baseURL: 'http://127.0.0.1:8080/v1', api: 'openai-completions', models } } } },
          ] })
        },
        replace: async (ns, section, revision) => {
          assert.equal(ns, 'model-picker-augmented')
          assert.equal(revision, undefined)
          stored = structuredClone(section)
          writes.push(['replace', ns, stored])
          return ok({ revision: 2, value: stored })
        },
        mutate: async (ns, ops, revision) => {
          writes.push(['mutate', ns, structuredClone(ops), revision])
          return ok({ revision: 4 })
        },
      },
      session: { modelCatalog: async () => catalogError
        ? { ok: false, error: { code: 'catalog/unavailable', message: catalogError } }
        : ok({ groups: [{ id: 'local', name: 'Local', models }], failures: [] }) },
      llm: {
        listProviders: async () => ok([{ id: 'local', name: 'Local' }]),
        listConfigurableProviders: async () => ok([
          { provider: 'local', displayName: 'Local', settingsNs: 'models', settingsPath: ['providers', 'local'] },
          { provider: 'offline', displayName: 'Inactive', settingsNs: 'models', settingsPath: ['providers', 'offline'] },
        ]),
        discoverModels: async (ns, request) => {
          discoveries.push([ns, structuredClone(request)])
          return ok([{ id: 'new-model', name: 'New model' }])
        },
      },
    },
  }
  Object.defineProperty(ctx, 'connection', { get() { throw new Error('The removed connection.api must not be accessed') } })
  let plugin
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load: definition => { plugin = definition.factory(name => { assert.equal(name, 'react'); return React }) } } },
    document: dom.window.document, console, setTimeout, clearTimeout,
  })
  for (const service of ['remote.settings', 'remote.llm', 'remote.session']) assert(plugin.inject.includes(service))
  const root = createRoot(dom.window.document.querySelector('#root'))
  await act(async () => {
    plugin.apply(ctx)
    await Promise.resolve()
    assert(registrations.has('conversation.input.model'))
    root.render(React.createElement(registrations.get('settings.section').component, { t: key => key }))
  })
  return {
    dom, writes, discoveries,
    stored: () => stored,
    click: async text => {
      const button = [...dom.window.document.querySelectorAll('button')].find(node => node.textContent === text)
      assert(button, `Missing button: ${text}`)
      await act(async () => button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
    },
    async close() {
      await act(async () => root.unmount())
      for (const dispose of effects) if (typeof dispose === 'function') dispose()
      dom.window.close()
      delete globalThis.window
      delete globalThis.document
      delete globalThis.IS_REACT_ACT_ENVIRONMENT
    },
  }
}

test('current Remote API loads curation and persists unpin, pin and visibility changes', async () => {
  const ui = await mount()
  try {
    assert.equal(ui.dom.window.document.querySelectorAll('.msp-card').length, 1)
    await ui.click('settings.unpin')
    assert.deepEqual(ui.stored().pinned, [])
    await ui.click('settings.pin')
    assert.deepEqual(ui.stored().pinned, ['local/qwen'])
    await ui.click('settings.visible')
    assert.deepEqual(ui.stored().hidden, { 'local/qwen': true })
    await ui.click('settings.hidden')
    assert.deepEqual(ui.stored().hidden, {})
    assert.equal(ui.writes.length, 4)
  } finally { await ui.close() }
})

test('provider refresh joins active routes and uses positional discovery and revision-checked writes', async () => {
  const ui = await mount()
  try {
    await ui.click('settings.refresh')
    assert.deepEqual(ui.discoveries, [['models', { provider: 'local', baseURL: 'http://127.0.0.1:8080/v1', api: 'openai-completions' }]])
    assert.deepEqual(ui.writes[0], ['mutate', 'model-picker-augmented', [], undefined])
    const [, ns, ops, revision] = ui.writes[1]
    assert.equal(ns, 'models')
    assert.equal(revision, 3)
    assert.deepEqual(ops[0].path, ['providers', 'local', 'models'])
    assert.deepEqual(ops[0].value.map(model => model.id), ['qwen', 'new-model'])
  } finally { await ui.close() }
})

test('a refused catalog read renders an actionable message without failing plugin load', async () => {
  const ui = await mount({ catalogError: 'Provider catalog is unavailable' })
  try {
    assert(ui.dom.window.document.querySelector('.msp-noteError'))
    assert(ui.dom.window.document.body.textContent.includes('settings.loadError'))
    assert.equal(ui.writes.length, 0)
  } finally { await ui.close() }
})
