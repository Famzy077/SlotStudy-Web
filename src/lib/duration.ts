function unit(value: number, label: string) {
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function formatDurationSeconds(value: number): string {
  const seconds = Math.max(0, Math.round(value));
  if (seconds === 0) return '0 minutes';
  if (seconds < 60) return unit(seconds, 'second');

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return unit(minutes, 'minute');

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes
      ? `${unit(hours, 'hour')} ${unit(remainingMinutes, 'minute')}`
      : unit(hours, 'hour');
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours
    ? `${unit(days, 'day')} ${unit(remainingHours, 'hour')}`
    : unit(days, 'day');
}

export function formatStudyHours(hours: number): string {
  if (!Number.isFinite(hours)) return '—';
  return formatDurationSeconds(hours * 60 * 60);
}
