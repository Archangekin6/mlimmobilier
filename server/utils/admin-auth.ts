export function isAdminProfileForUser(
  userId: string | null | undefined,
  profile: { user_id: string } | null | undefined
): boolean {
  return Boolean(userId && profile && profile.user_id === userId)
}
