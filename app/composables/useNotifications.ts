export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id: number
  type: NotificationType
  message: string
}

export function useNotifications() {
  const notifications = useState<AppNotification[]>('app-notifications', () => [])

  const notify = (type: NotificationType, message: string, timeout = 4000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    notifications.value = [...notifications.value, { id, type, message }]
    window.setTimeout(() => dismiss(id), timeout)
  }

  const dismiss = (id: number) => {
    notifications.value = notifications.value.filter(notification => notification.id !== id)
  }

  return { notifications, notify, dismiss }
}
