// ---------------------------------------------------------------------------
// Validator — form validation engine
//
// Design patterns used:
//   - Observer Pattern  : integrates with VIEW.addBeforeLoad to auto-init
//   - Strategy Pattern  : invalid-field handling is injectable via the emitter
//   - Decorator Pattern : constraints are attached to elements by attribute
//   - Registry Pattern  : ConstraintHandler lookup by name
// ---------------------------------------------------------------------------

import type { EventEmitter } from '../core/event-emitter.js';
import type { AppEventMap, ValidationResult, TextareaValidationResult } from '../types.js';
import { scrollToElement } from '../utils/dom.js';
import {
  type ConstraintHandler,
  builtInConstraints,
} from './constraints.js';

type InvalidCallback = (labelNames: string[], elements: HTMLElement[]) => void;
type TextareaTooLongCallback = (
  labelNames: string[],
  maxlengths: number[],
  elements: HTMLElement[],
) => void;

export class Validator {
  private emitter: EventEmitter<AppEventMap>;
  private constraints: Map<string, ConstraintHandler> = new Map();
  private requiredInvalidCb: InvalidCallback | null = null;
  private textareaTooLongCb: TextareaTooLongCallback | null = null;

  constructor(emitter: EventEmitter<AppEventMap>) {
    this.emitter = emitter;

    // Register built-in constraints
    for (const c of builtInConstraints) {
      this.constraints.set(c.name, c);
    }
  }

  // -- Constraint Registration ------------------------------------------------

  /**
   * Register a custom constraint handler.
   *
   * Registry Pattern — extend validation without modifying library code.
   */
  addConstraint(handler: ConstraintHandler): void {
    this.constraints.set(handler.name, handler);
  }

  // -- Callback Setters (Strategy Pattern) ------------------------------------

  /**
   * Override the default behavior when required-field validation fails.
   *
   * Strategy Pattern — consumers inject their own notification UI.
   */
  setRequiredInvalidCallback(cb: InvalidCallback): void {
    this.requiredInvalidCb = cb;
  }

  setTextareaTooLongCallback(cb: TextareaTooLongCallback): void {
    this.textareaTooLongCb = cb;
  }

  // -- Initialization (called by VIEW.addBeforeLoad) --------------------------

  /**
   * Attach constraint handlers to all matching elements within `context`.
   *
   * This is the **beforeLoad hook** — it is registered with `VIEW.addBeforeLoad`
   * so that dynamically loaded content is also initialized.
   */
  initConstraints(context: HTMLElement): void {
    const elements = context.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[constraint]',
    );

    for (const el of elements) {
      const tokens = (el.getAttribute('constraint') || '').split(/\s+/);

      for (const token of tokens) {
        if (!token) continue;
        const handler = this.constraints.get(token);
        handler?.attach(el);
      }
    }

    // Auto-select text on focus (text inputs and textareas)
    const focusTargets = context.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[type="text"], textarea',
    );
    for (const el of focusTargets) {
      el.addEventListener('focus', () => {
        setTimeout(() => el.select(), 1);
      });
    }

    // Ignore-validation submit buttons
    this.bindIgnoreValidation(context);
  }

  // -- Form Submit Integration ------------------------------------------------

  private bindIgnoreValidation(context: HTMLElement): void {
    const buttons = context.querySelectorAll<HTMLInputElement>(
      "input[type='submit'][ignoreValidation='true']",
    );
    for (const btn of buttons) {
      btn.addEventListener('click', () => {
        btn.closest('form')?.classList.add('ignoreValidation');
      });
    }

    const forms = context.querySelectorAll<HTMLFormElement>('form');
    for (const form of forms) {
      form.addEventListener('submit', (e) => {
        if (!form.classList.contains('ignoreValidation')) {
          if (!this.validate(form)) {
            e.preventDefault();
          }
        }
        form.classList.remove('ignoreValidation');
      });
    }
  }

  // -- Core Validation Logic --------------------------------------------------

  /**
   * Validate all required fields and textarea lengths within a container.
   *
   * @returns `true` if all validations pass.
   */
  validate(container: HTMLElement): boolean {
    // Check textarea max-length first
    const tooLong = this.checkTextareaLengths(container);
    if (!tooLong.valid) {
      this.handleTextareaTooLong(tooLong);
      return false;
    }

    // Check required fields
    const result = this.checkRequired(container);
    if (!result.valid) {
      this.handleRequiredInvalid(result);
      return false;
    }

    return true;
  }

  private checkTextareaLengths(container: HTMLElement): TextareaValidationResult {
    const textareas = container.querySelectorAll<HTMLTextAreaElement>('textarea[maxlength]');
    const invalidElements: HTMLElement[] = [];
    const labelNames: string[] = [];
    const maxlengths: number[] = [];

    for (const ta of textareas) {
      const max = parseInt(ta.getAttribute('maxlength') || '0', 10);
      if (ta.value.length > max) {
        invalidElements.push(ta);
        labelNames.push(ta.getAttribute('labelName') || ta.name || '');
        maxlengths.push(max);
      }
    }

    return {
      valid: invalidElements.length === 0,
      invalidElements,
      labelNames,
      maxlengths,
    };
  }

  private checkRequired(container: HTMLElement): ValidationResult {
    const elements = container.querySelectorAll<HTMLElement>(
      "[constraint~='required']",
    );

    // Group by name (for radio/checkbox groups)
    const groups = new Map<string, HTMLElement[]>();
    let idCounter = 0;

    for (const el of elements) {
      const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      let name = input.name || `__unnamed_${idCounter++}`;

      if (!groups.has(name)) {
        groups.set(name, []);
      }
      groups.get(name)!.push(el);
    }

    const invalidElements: HTMLElement[] = [];
    const labelNames: string[] = [];

    for (const [, groupElements] of groups) {
      let notEmpty = false;

      for (const el of groupElements) {
        const input = el as HTMLInputElement;

        if (input.type === 'radio' || input.type === 'checkbox') {
          if (input.checked) notEmpty = true;
        } else if (
          (el.getAttribute('constraint') || '').includes('number')
        ) {
          if (input.value !== '0' && input.value !== '') notEmpty = true;
        } else if (input.value && input.value !== '') {
          notEmpty = true;
        }
      }

      if (!notEmpty) {
        const first = groupElements[0]!;
        invalidElements.push(first);
        labelNames.push(
          first.getAttribute('labelName') ||
          (first as HTMLInputElement).name ||
          '',
        );
      }
    }

    return {
      valid: invalidElements.length === 0,
      invalidElements,
      labelNames,
    };
  }

  // -- Default Failure Handlers -----------------------------------------------

  private handleRequiredInvalid(result: ValidationResult): void {
    this.emitter.emit('validation:invalid', {
      labelNames: result.labelNames,
      elements: result.invalidElements,
    });

    if (this.requiredInvalidCb) {
      this.requiredInvalidCb(result.labelNames, result.invalidElements);
      return;
    }

    // Default behavior: alert + scroll
    const text = result.labelNames.map((n) => `"${n}"`).join(', ');
    scrollToElement(result.invalidElements[0]!);
    window.alert(`${text} is required!`);
  }

  private handleTextareaTooLong(result: TextareaValidationResult): void {
    this.emitter.emit('validation:textareaTooLong', {
      labelNames: result.labelNames,
      maxlengths: result.maxlengths,
      elements: result.invalidElements,
    });

    if (this.textareaTooLongCb) {
      this.textareaTooLongCb(
        result.labelNames,
        result.maxlengths,
        result.invalidElements,
      );
      return;
    }

    // Default behavior: alert + scroll
    const lines = result.labelNames.map(
      (name, i) => `"${name}" length is too long, max length is ${result.maxlengths[i]}!`,
    );
    scrollToElement(result.invalidElements[0]!);
    window.alert(lines.join('\n'));
  }
}
