// ---------------------------------------------------------------------------
// Built-in formatters — vanilla input masking (no 3rd-party dependency)
//
// Replaces jquery.maskedinput with a lightweight mask engine.
//
// Design patterns used:
//   - Strategy Pattern : each formatter is an independent strategy
//   - Template Method  : all formatters share the same `applyMask` core,
//                        only the mask definition varies
// ---------------------------------------------------------------------------

import type { Formatter } from '../types.js';

/**
 * Mask characters:
 *   `9` → digit (0-9)
 *   `A` → uppercase letter (A-Z)
 *   `?` → makes the rest of the mask optional
 *   Any other character → literal (inserted automatically)
 */
function applyMask(element: HTMLInputElement, mask: string): void {
  // Find the position where `?` appears (optional section starts)
  const optionalIdx = mask.indexOf('?');
  const cleanMask = mask.replace('?', '');

  function formatValue(raw: string): string {
    let result = '';
    let rawIdx = 0;

    for (let maskIdx = 0; maskIdx < cleanMask.length && rawIdx < raw.length; maskIdx++) {
      const maskChar = cleanMask[maskIdx]!;

      if (maskChar === '9') {
        // Expect digit
        while (rawIdx < raw.length && !/\d/.test(raw[rawIdx]!)) rawIdx++;
        if (rawIdx < raw.length) {
          result += raw[rawIdx]!;
          rawIdx++;
        } else {
          break;
        }
      } else if (maskChar === 'A') {
        // Expect uppercase letter
        while (rawIdx < raw.length && !/[A-Z]/i.test(raw[rawIdx]!)) rawIdx++;
        if (rawIdx < raw.length) {
          result += raw[rawIdx]!.toUpperCase();
          rawIdx++;
        } else {
          break;
        }
      } else {
        // Literal — insert it
        result += maskChar;
        // If the raw char matches the literal, skip it
        if (raw[rawIdx] === maskChar) rawIdx++;
      }
    }

    return result;
  }

  function getPlaceholder(): string {
    const required = optionalIdx >= 0 ? cleanMask.substring(0, optionalIdx) : cleanMask;
    return required
      .replace(/9/g, '_')
      .replace(/A/g, '_');
  }

  // Set placeholder to show expected format
  if (!element.placeholder) {
    element.placeholder = getPlaceholder();
  }

  element.addEventListener('input', () => {
    const pos = element.selectionStart ?? 0;
    const oldLen = element.value.length;
    element.value = formatValue(element.value);
    const newLen = element.value.length;
    // Preserve cursor position intelligently
    const newPos = pos + (newLen - oldLen);
    element.setSelectionRange(newPos, newPos);
  });

  element.addEventListener('blur', () => {
    element.value = formatValue(element.value);
  });

  // Format the initial value if present
  if (element.value) {
    element.value = formatValue(element.value);
  }
}

// -- Built-in formatter definitions -----------------------------------------

/** Taiwan ID number: A123456789 */
export const idNumberFormatter: Formatter = {
  key: 'idNumber',
  format: (el) => applyMask(el, 'A999999999'),
};

/** Date: YYYY-MM-DD (day is optional via `?`) */
export const dateFormatter: Formatter = {
  key: 'date',
  format: (el) => applyMask(el, '9999-99?-99'),
};

/** Time: HH:MM */
export const timeFormatter: Formatter = {
  key: 'time',
  format: (el) => applyMask(el, '99:99'),
};

export const builtInFormatters: Formatter[] = [
  idNumberFormatter,
  dateFormatter,
  timeFormatter,
];
