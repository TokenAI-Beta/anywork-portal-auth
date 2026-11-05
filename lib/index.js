/**
 * Host entry for anywork-portal-auth (0.2.0).
 * Browser surface lives in ./client.js — a real sidebar panel (id portal-auth)
 * covering login, role gates, overview / members / usage / announcements /
 * calendar / enter-workbench mock.
 * Host apply stays empty: no host-side routes (host-half stub, same shape as
 * library-plugin). Future: Anywork portal cookie /desk_session on the host.
 */
export const name = "anywork-portal-auth";

export function apply() {
  // No host-side routes. Portal UI is the client panel.
}
