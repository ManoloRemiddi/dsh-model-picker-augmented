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

// dsh-model-picker-augmented node half.
//
// The browser half (the "./client" export, lib/client.js) provides the
// searchable composer model picker and the "Model Picker Augmented" settings
// page. This node half exists so the bundle patch row (cordis.patch.yml) can
// mount the package in the web profile — the client-modules scan reads the
// `dsh.client` declaration from packages mounted in the host Loader — and it
// registers the plugin's durable settings namespace: the browser half persists
// the curated list (hidden models + pinned order) through the harness settings
// document (`model-picker-augmented` in settings.yaml), so it survives browser
// and machine restarts. Keep this file: removing it breaks the mount and the
// persistence.

import z from "@deepseek-ai/schemastery";

export const Config = z.object({
  hidden: z.dict(z.boolean()).default({}).volatile(),
  pinned: z.array(z.string()).default([]).volatile(),
});

export const name = "dsh-model-picker-augmented";
export const inject = ["settings"];
export function apply(ctx) {
  const settings = ctx.settings;
  console.log("[msp-host] apply running; settings service:", typeof settings);
  if (settings === undefined) {
    console.error("[msp-host] settings service unavailable — curation will not persist");
    return;
  }
  if (typeof settings.register === 'function') {
    settings.register('model-picker-augmented', z.object({hidden:z.dict(z.boolean()),pinned:z.array(z.string())}));
  } else {
    // DSH 0.2 derives forms and durable configuration from the Loader's Config.
    ctx.effect(() => settings.configure({auto: false}));
  }
  console.log("[msp-host] settings namespace 'model-picker-augmented' registered");
}
