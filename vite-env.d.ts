/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_MARKED_PDF: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
