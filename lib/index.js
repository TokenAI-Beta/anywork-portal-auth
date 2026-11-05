/**
 * Host entry for anywork-portal-auth (壳 v0 stub).
 * Browser surface (login / desk_session / role gate) lives in ./client.js
 * and is demonstrated by demo/index.html without installing into DSH.
 * Future: integrate Anywork portal cookie /desk_session with the host.
 */
export const name = "anywork-portal-auth";

export function apply() {
  // v0: no host-side routes. Auth demo is client/mock only.
}
