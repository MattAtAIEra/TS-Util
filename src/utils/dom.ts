// ---------------------------------------------------------------------------
// DOM utility functions — vanilla TypeScript replacements for jQuery helpers
//
// Design patterns used:
//   - Facade Pattern : simple API over verbose native DOM methods
// ---------------------------------------------------------------------------

import type { FormDataRecord } from '../types.js';

/**
 * Convert all named form elements within a container to a key-value record.
 *
 * Replaces the original jQuery-based `formToJSON`.
 *
 * @param container - The DOM element containing form inputs.
 * @param options.ignoreDisabled - Skip disabled elements (default `false`).
 *
 * @example
 * ```ts
 * const data = formToJSON(document.getElementById('myForm')!);
 * // { username: "alice", roles: ["admin", "editor"] }
 * ```
 */
export function formToJSON(
  container: HTMLElement,
  options: { ignoreDisabled?: boolean } = {},
): FormDataRecord {
  const { ignoreDisabled = false } = options;

  const selectors =
    'input[name], textarea[name], select[name]';
  let elements = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selectors),
  );

  if (ignoreDisabled) {
    elements = elements.filter((el) => !el.disabled);
  }

  const params: FormDataRecord = {};

  for (const el of elements) {
    const name = el.name;
    if (!name) continue;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      if (!(name in params)) params[name] = [];
      if (el.checked) (params[name] as string[]).push(el.value);
    } else if (el instanceof HTMLSelectElement && el.multiple) {
      if (!(name in params)) params[name] = [];
      const selected = Array.from(el.selectedOptions).map((o) => o.value);
      (params[name] as string[]).push(...selected);
    } else if (el instanceof HTMLInputElement && el.type === 'radio') {
      if (el.checked) params[name] = el.value;
    } else {
      const existing = params[name];
      if (existing === undefined) {
        params[name] = el.value;
      } else if (typeof existing === 'string') {
        params[name] = [existing, el.value];
      } else {
        existing.push(el.value);
      }
    }
  }

  return params;
}

/**
 * Check whether a value is a valid date.
 *
 * Accepts a `Date` object or a string in `yyyy-MM-dd` / `yyyy/MM/dd` format.
 */
export function isDateValid(date: Date | string): boolean {
  if (date instanceof Date) return !isNaN(date.getTime());
  return /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(date);
}

/**
 * Parse an HTML string into a `DocumentFragment`.
 */
export function parseHTML(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

/**
 * Smoothly scroll an element into view.
 */
export function scrollToElement(element: HTMLElement): void {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Merge multiple option objects (shallow). Later sources override earlier ones.
 * A typed, zero-dependency replacement for `$.extend()`.
 */
export function defaults<T extends Record<string, unknown>>(
  base: T,
  ...overrides: Partial<T>[]
): T {
  return Object.assign({}, base, ...overrides);
}
