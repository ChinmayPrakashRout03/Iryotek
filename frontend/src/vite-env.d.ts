/// <reference types="vite/client" />

declare module './main.js' {
  export const IMAGES: Record<string, string>
  export function initExperience(root: HTMLElement, navigate?: (path: string) => void): (() => void) | void
}
