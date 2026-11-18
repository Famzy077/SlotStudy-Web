import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2 } from 'lucide-react';
import api, { getErrorMessage } from '../../../lib/api';
import { useApiQuery, list } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import type { DataObject } from '../../../types';

function updateNotificationCache(
  current: unknown,
  targetId?: string,
): unknown {
  const markItems = (items: DataObject[]) =>
    items.map((item) =>
      !targetId || String(item.id) === targetId
        ? { ...item, isRead: true }
        : item,
    );

  if (Array.isArray(current)) {
    return markItems(current as DataObject[]);
  }

  if (current && typeof current === 'object') {
    const record = current as Record<string, unknown>;
    const rawItems = Array.isArray(record.data) ? (record.data as DataObject[]) : null;
    if (!rawItems) return current;

    const updatedItems = markItems(rawItems);
    const prevUnread =
      typeof record.unreadCount === 'number'
        ? record.unreadCount
        : rawItems.filter((item) => !item.readAt && !item.isRead).length;
    const nextUnread = targetId ? Math.max(0, prevUnread - 1) : 0;

    return {
      ...record,
      data: updatedItems,
      unreadCount: nextUnread,
    };
  }

  return current;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [actionError, setActionError] = useState('');
  const result = useApiQuery<unknown>('notifications', '/notifications', true, {
    limit: '50',
  });
  const notifications = list<DataObject>(result.data, 'notifications');
  const unreadCount = notifications.filter(
    (notification) => !notification.readAt && !notification.isRead,
  ).length;
  const visible = notifications.filter(
    (notification) => filter === 'All' || (!notification.readAt && !notification.isRead),
  );

  async function markAllRead() {
    setActionError('');
    try {
      try {
        await api.patch('/notifications/read-all');
      } catch {
        await api.post('/notifications/read', {});
      }
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) =>
        updateNotificationCache(old),
      );
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function markRead(notification: DataObject) {
    if (!notification.id || notification.readAt || notification.isRead) return;
    setActionError('');
    const id = String(notification.id);
    try {
      try {
        await api.patch(`/notifications/${id}`, { isRead: true });
      } catch {
        await api.post('/notifications/read', { ids: [id] });
      }
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) =>
        updateNotificationCache(old, id),
      );
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <div>
      <PageTitle
        eyebrow="A LITTLE NUDGE, WHEN YOU NEED IT"
        title="Notifications"
        subtitle="Helpful reminders and updates from your study space."
        action={
          <button className="button button-outline" onClick={markAllRead}>
            Mark all as read
          </button>
        }
      />
      <QueryNotice error={result.error} />
      {actionError && <div className="form-alert">{actionError}</div>}
      <div className="filter-tabs notification-filters">
        {[
          { key: 'All', label: `All (${notifications.length})` },
          { key: 'Unread', label: `Unread (${unreadCount})` },
        ].map((tab) => (
          <button
            className={filter === tab.key ? 'filter-active' : ''}
            onClick={() => setFilter(tab.key)}
            key={tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {result.isLoading ? (
        <LoadingLine />
      ) : visible.length ? (
        <div className="notification-list">
          {visible.map((item, index) => (
            <button
              className={`notification-item ${item.readAt || item.isRead ? '' : 'notification-unread'}`}
              key={String(item.id || index)}
              onClick={() => void markRead(item)}
            >
              <span className="notification-item-icon"><Bell size={17} /></span>
              <span>
                <b>{String(item.title || 'Notification')}</b>
                <small>{String(item.message || item.body || '')}</small>
                <small>{item.createdAt ? new Date(String(item.createdAt)).toLocaleString() : ''}</small>
              </span>
              {!item.readAt && !item.isRead && <span className="unread-dot" />}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="You’re all caught up"
          detail="When something needs your attention, you’ll find it here."
        />
      )}
    </div>
  );
}
