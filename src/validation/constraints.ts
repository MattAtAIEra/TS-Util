// ---------------------------------------------------------------------------
// Constraint handlers — individual input behavior decorators
//
// Design patterns used:
//   - Strategy Pattern  : each constraint is an independent strategy object
//   - Decorator Pattern : constraints add behavior to plain HTML inputs
//                         via attribute-driven binding
//   - Registry Pattern  : constraints are registered by name and looked up
//                         from the `constraint` attribute at runtime
// ---------------------------------------------------------------------------

import { sprintf } from '../utils/sprintf.js';
import { isDateValid } from '../utils/dom.js';

/**
 * A constraint handler defines behavior that is attached to input elements
 * bearing a matching `constraint` attribute value.
 *
 * Each handler is self-contained — it knows how to bind its own events
 * and how to validate its own input.
 */
export interface ConstraintHandler {
  /** The constraint keyword (e.g. `"date"`, `"number"`). */
  name: string;

  /**
   * Called once per matching element to attach event listeners.
   * This is the **Decorator** step — it augments the element's behavior.
   */
  attach(element: HTMLInputElement | HTMLTextAreaElement): void;
}

// -- Date constraint --------------------------------------------------------

export const dateConstraint: ConstraintHandler = {
  name: 'date',

  attach(element) {
    element.addEventListener('change', () => {
      if (element.value !== '' && !isDateValid(element.value)) {
        element.value = '';
      }
    });

    // Disable IME for date input
    (element.style as unknown as Record<string, string>)['imeMode'] = 'disabled';
    element.setAttribute('inputmode', 'numeric');
  },
};

// -- Number constraint ------------------------------------------------------

export const numberConstraint: ConstraintHandler = {
  name: 'number',

  attach(element) {
    element.addEventListener('keydown', ((event: KeyboardEvent) => {
      // Allow: backspace, delete, tab, escape, enter, arrows, home, end
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End',
      ];
      if (allowedKeys.includes(event.key)) return;
      // Allow Ctrl/Cmd + A/C/V/X
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key)) return;
      // Allow digits, dot, minus
      if (/[\d.\-]/.test(event.key)) return;
      event.preventDefault();
    }) as EventListener);

    element.addEventListener('change', () => {
      const val = element.value;
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(val) || /^0\d+$/.test(val)) {
        element.value = '0';
      }
    });

    // Default empty number fields to 0
    if (element.value === '') {
      element.value = '0';
    }

    (element.style as unknown as Record<string, string>)['imeMode'] = 'disabled';
    element.setAttribute('inputmode', 'decimal');
  },
};

// -- Time constraint --------------------------------------------------------

export const timeConstraint: ConstraintHandler = {
  name: 'time',

  attach(element) {
    element.addEventListener('blur', () => {
      const input = element.value;
      let hour = '00';
      let minute = '00';

      if (/^\d{1,4}$/.test(input)) {
        hour = sprintf('%02s', input.substring(0, 2));
        minute = sprintf('%02s', input.substring(2, 4));
      } else if (/^\d{0,2}:\d{0,2}$/.test(input)) {
        const colonIdx = input.indexOf(':');
        hour = sprintf('%02s', input.substring(0, colonIdx));
        minute = sprintf('%02s', input.substring(colonIdx + 1));
      }

      element.value = `${hour}:${minute}`;
    });

    element.addEventListener('keydown', ((event: KeyboardEvent) => {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'Home', 'End',
      ];
      if (allowedKeys.includes(event.key)) return;
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key)) return;
      if (/[\d:]/.test(event.key)) return;
      event.preventDefault();
    }) as EventListener);

    (element.style as unknown as Record<string, string>)['imeMode'] = 'disabled';
    element.setAttribute('inputmode', 'numeric');
  },
};

// -- UpperCase constraint ---------------------------------------------------

export const upperCaseConstraint: ConstraintHandler = {
  name: 'upperCase',

  attach(element) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    element.addEventListener('keyup', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const val = element.value;
        if (/[a-z]/.test(val)) {
          element.value = val.toUpperCase();
        }
      }, 500);
    });
  },
};

// -- OnlyEn constraint ------------------------------------------------------

export const onlyEnConstraint: ConstraintHandler = {
  name: 'onlyEn',

  attach(element) {
    (element.style as unknown as Record<string, string>)['imeMode'] = 'disabled';
    element.setAttribute('inputmode', 'text');
    element.setAttribute('lang', 'en');
  },
};

// -- All built-in constraints -----------------------------------------------

export const builtInConstraints: ConstraintHandler[] = [
  dateConstraint,
  numberConstraint,
  timeConstraint,
  upperCaseConstraint,
  onlyEnConstraint,
];
