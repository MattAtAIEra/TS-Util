// ---------------------------------------------------------------------------
// MSG module — vanilla DOM dialog system (no 3rd-party dependency)
//
// Design patterns used:
//   - Facade Pattern : simple `info()`, `modal()`, `confirm()` API over
//                      raw DOM creation + CSS styling
//   - Strategy Pattern : appearance is controlled via CSS classes, consumers
//                        can override styling without touching this module
// ---------------------------------------------------------------------------

import type { MessageOptions } from '../types.js';

const OVERLAY_CLASS = 'rs-msg-overlay';
const DIALOG_CLASS = 'rs-msg-dialog';
const TITLE_CLASS = 'rs-msg-title';
const BODY_CLASS = 'rs-msg-body';
const BUTTON_BAR_CLASS = 'rs-msg-buttons';
const BUTTON_CLASS = 'rs-msg-btn';

let injectedStyles = false;

function injectStyles(): void {
  if (injectedStyles) return;
  injectedStyles = true;

  const css = `
    .${OVERLAY_CLASS} {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000;
      animation: rs-fade-in 0.15s ease-out;
    }
    .${DIALOG_CLASS} {
      background: #fff; border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      min-width: 300px; max-width: 520px;
      padding: 0; overflow: hidden;
      animation: rs-slide-up 0.2s ease-out;
    }
    .${TITLE_CLASS} {
      padding: 16px 20px; font-weight: 600; font-size: 15px;
      border-bottom: 1px solid #eee;
    }
    .${BODY_CLASS} {
      padding: 20px; font-size: 14px; line-height: 1.6;
    }
    .${BUTTON_BAR_CLASS} {
      padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px;
      border-top: 1px solid #eee;
    }
    .${BUTTON_CLASS} {
      padding: 8px 18px; border: 1px solid #ccc; border-radius: 4px;
      background: #fff; cursor: pointer; font-size: 14px;
      transition: background 0.15s;
    }
    .${BUTTON_CLASS}:hover { background: #f5f5f5; }
    .${BUTTON_CLASS}[data-primary] {
      background: #2563eb; color: #fff; border-color: #2563eb;
    }
    .${BUTTON_CLASS}[data-primary]:hover { background: #1d4ed8; }
    @keyframes rs-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rs-slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

interface DialogHandle {
  close: () => void;
  element: HTMLElement;
}

function createDialog(
  message: string,
  options: {
    title?: string;
    buttons?: { label: string; value: string; primary?: boolean }[];
    onButton?: (value: string) => void;
    modal?: boolean;
  } = {},
): DialogHandle {
  injectStyles();

  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;

  const dialog = document.createElement('div');
  dialog.className = DIALOG_CLASS;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', String(!!options.modal));

  // Title
  if (options.title) {
    const titleEl = document.createElement('div');
    titleEl.className = TITLE_CLASS;
    titleEl.textContent = options.title;
    dialog.appendChild(titleEl);
  }

  // Body
  const body = document.createElement('div');
  body.className = BODY_CLASS;
  body.innerHTML = message;
  dialog.appendChild(body);

  // Buttons
  if (options.buttons && options.buttons.length > 0) {
    const bar = document.createElement('div');
    bar.className = BUTTON_BAR_CLASS;

    for (const btn of options.buttons) {
      const el = document.createElement('button');
      el.className = BUTTON_CLASS;
      el.textContent = btn.label;
      if (btn.primary) el.setAttribute('data-primary', '');
      el.addEventListener('click', () => {
        options.onButton?.(btn.value);
        close();
      });
      bar.appendChild(el);
    }
    dialog.appendChild(bar);
  }

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Close on overlay click (if not modal)
  if (!options.modal) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  function close(): void {
    overlay.remove();
  }

  return { close, element: overlay };
}

export class Message {
  private currentModal: DialogHandle | null = null;

  /**
   * Show a brief informational message. Auto-closes after `options.autoclose` ms.
   */
  info(message: string, options: MessageOptions = {}): DialogHandle {
    const { autoclose = 5000, title } = options;

    const handle = createDialog(message, { title });

    if (autoclose > 0) {
      setTimeout(() => handle.close(), autoclose);
    }

    return handle;
  }

  /**
   * Show a modal dialog that must be explicitly dismissed.
   */
  modal(message: string, options: MessageOptions = {}): DialogHandle {
    this.dismissModal();

    const handle = createDialog(message, {
      title: options.title,
      modal: true,
      buttons: [{ label: 'OK', value: 'ok', primary: true }],
    });

    this.currentModal = handle;
    return handle;
  }

  /**
   * Show a Yes/No confirmation dialog. Executes `onConfirm` if "Yes" is chosen.
   *
   * @returns A `DialogHandle` for programmatic control.
   */
  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
  ): DialogHandle {
    return createDialog(message, {
      title,
      modal: true,
      buttons: [
        { label: 'Yes', value: 'Y', primary: true },
        { label: 'No', value: 'N' },
      ],
      onButton: (val) => {
        if (val === 'Y') onConfirm();
      },
    });
  }

  /**
   * Close the currently open modal (if any).
   */
  dismissModal(): void {
    this.currentModal?.close();
    this.currentModal = null;
  }
}
