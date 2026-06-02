/// <reference types="vite/client" />

declare module "*.bin" {
  const dataUrl: string;
  export default dataUrl;
}
