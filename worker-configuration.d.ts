declare namespace Cloudflare {
  interface Env {
    GameRoom: DurableObjectNamespace;
  }
}

// Ambient Env used by the worker entrypoints.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Env extends Cloudflare.Env {}
