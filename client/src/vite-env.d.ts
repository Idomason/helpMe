/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_REQUEST_UPLOAD_PRESET: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
