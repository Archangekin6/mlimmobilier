const longTextFields = new Set([
  'aboutPresentationText',
  'aboutLocationText',
  'aboutMissionText'
])

export function isValidSiteSettingsString(field: string, value: string): boolean {
  return value.length <= (longTextFields.has(field) ? 4000 : 2000)
}
