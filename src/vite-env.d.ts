/// <reference types="vite/client" />

// View Transitions API – not yet in all TS DOM libs
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?(callback: () => void): ViewTransition;
}
