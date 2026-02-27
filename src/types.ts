// ---------------------------------------------------------------------------
// Shared type definitions for @ts-util/core
// ---------------------------------------------------------------------------

/** Supported constraint types declared via the `constraint` HTML attribute. */
export type ConstraintType =
  | 'required'
  | 'date'
  | 'number'
  | 'time'
  | 'upperCase'
  | 'onlyEn';

/** A record whose values are either a single string or an array of strings. */
export type FormDataRecord = Record<string, string | string[]>;

// -- AJAX -------------------------------------------------------------------

export interface AjaxRequestParams {
  url: string;
  data?: Record<string, unknown>;
  form?: HTMLElement;
  ignoreDisabled?: boolean;
  noblock?: boolean;
  headers?: Record<string, string>;
  success?: (data: unknown) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface AjaxJsonRequestParams<T = unknown> extends Omit<AjaxRequestParams, 'success'> {
  success?: (data: T) => void;
}

// -- VIEW -------------------------------------------------------------------

export interface ViewLoadParams extends Omit<AjaxRequestParams, 'success'> {
  success?: (content: HTMLElement) => void;
}

// -- MSG --------------------------------------------------------------------

export interface MessageOptions {
  autoclose?: number;
  title?: string;
}

export interface ConfirmButton {
  label: string;
  value: string;
}

// -- Validation -------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  invalidElements: HTMLElement[];
  labelNames: string[];
}

export interface TextareaValidationResult extends ValidationResult {
  maxlengths: number[];
}

// -- Formatting -------------------------------------------------------------

export interface Formatter {
  key: string;
  format: (element: HTMLInputElement) => void;
}

// -- Hook / Event Map -------------------------------------------------------

export interface AppEventMap {
  'ajax:before': { url: string };
  'ajax:after': { url: string };
  'ajax:error': { url: string; error: Error };
  'view:beforeLoad': { context: HTMLElement };
  'validation:invalid': { labelNames: string[]; elements: HTMLElement[] };
  'validation:textareaTooLong': {
    labelNames: string[];
    maxlengths: number[];
    elements: HTMLElement[];
  };
}
