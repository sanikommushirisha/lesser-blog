// The tool apps are plain JavaScript. These are the only two things TypeScript
// code asks of them: an app's default export mounts it, and the engine takes
// the utm_campaign for its plan buttons and whether the report email is live.
declare module '*.js' {
  const mount: () => void
  export default mount
  export function setCampaign(name: string): void
  export function setLive(on: boolean): void
}
