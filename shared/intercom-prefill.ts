// Opens the Intercom Messenger with a message already typed in the box. Nothing
// is sent: the visitor adds their question and presses send themselves.
//
// showNewMessage's own prefill is unreliable: Intercom drops the text when the
// Messenger booted only a few seconds earlier, or is already open on an earlier
// chat. So the text is also typed into the composer directly. The composer is a
// rich-text box (role="textbox") in the iframe named "intercom-messenger-frame"
// (it used to be a <textarea>); it is found by role and name, polled while it
// renders, and left alone if Intercom's own prefill already filled it.

type IntercomCall = (command: string, arg?: string) => void;

function typeIntoMessenger(text: string, tries = 16): void {
  try {
    const frame = document.querySelector<HTMLIFrameElement>('iframe[name="intercom-messenger-frame"]');
    const doc = frame?.contentDocument;
    const box = doc?.querySelector<HTMLElement>('[contenteditable="true"][role="textbox"], .messenger-rte-content');
    if (doc && box) {
      if ((box.textContent ?? "").trim()) return; // Intercom's own prefill worked
      box.focus();
      doc.execCommand("insertText", false, text);
      return;
    }
  } catch {
    // The Messenger frame is not reachable: the chat is open, the visitor types it themselves.
    return;
  }
  if (tries > 0) window.setTimeout(() => typeIntoMessenger(text, tries - 1), 250);
}

/** False when Intercom is not on the page (blocked, or not loaded yet). */
export function openIntercomWithText(text: string): boolean {
  const ic = (window as unknown as { Intercom?: IntercomCall }).Intercom;
  if (!ic) return false;
  ic("hide"); // a Messenger already open on an earlier chat ignores the prefill
  window.setTimeout(() => {
    ic("showNewMessage", text);
    window.setTimeout(() => typeIntoMessenger(text), 600);
  }, 150);
  return true;
}
