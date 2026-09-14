// Thin, crash-safe wrappers around expo-haptics. Every call is guarded so the
// app never throws on web or a device without a haptic engine.
import * as Haptics from 'expo-haptics';

export function tap() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}
export function select() {
  try { Haptics.selectionAsync(); } catch {}
}
export function success() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}
export function error() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}
export function warning() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
}

export default { tap, select, success, error, warning };
