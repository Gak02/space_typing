export type InputCallback = (char: string) => void;

export class InputHandler {
  private callback: InputCallback | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start(callback: InputCallback): void {
    this.callback = callback;
    document.addEventListener('keydown', this.handleKeyDown);
  }

  stop(): void {
    this.callback = null;
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.callback) return;

    // Ignore modifier keys
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    // Accept single printable characters (a-z, -, ')
    const key = event.key;

    if (key.length === 1 && /^[a-zA-Z\-']$/.test(key)) {
      event.preventDefault();
      this.callback(key.toLowerCase());
    }
  }
}
