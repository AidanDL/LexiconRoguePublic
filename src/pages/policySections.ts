/** Privacy policy sections, in order: [anchor id, heading]. */
export const policySections = [
  ['summary', 'Summary'],
  ['who-we-are', 'Who we are'],
  ['what-we-collect', 'Information we collect'],
  ['on-device', 'Information stored on your device'],
  ['advertising', 'Advertising (Google AdMob)'],
  ['consent', 'Your consent choices'],
  ['firebase', 'Analytics, crash reports and remote settings (Firebase)'],
  ['play-games', 'Google Play Games Services'],
  ['purchases', 'In-app purchases (Google Play Billing)'],
  ['updates', 'App updates and ratings'],
  ['notifications', 'Notifications'],
  ['permissions', 'Device permissions'],
  ['sharing', 'How information is shared'],
  ['children', 'Children'],
  ['retention', 'Data retention and deletion'],
  ['rights-gdpr', 'Your rights (EEA, UK and Switzerland)'],
  ['rights-us', 'Your rights (US states)'],
  ['security', 'Security'],
  ['transfers', 'International transfers'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact us'],
] as const

export type PolicySectionId = (typeof policySections)[number][0]

/** Heading for a section id. */
export function headingFor(id: PolicySectionId): string {
  return policySections.find(([key]) => key === id)![1]
}
