/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API adresi; tanımsızsa üretim backend'i kullanılır. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
