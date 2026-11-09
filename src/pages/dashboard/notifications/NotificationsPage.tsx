import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2 } from 'lucide-react';
import api, { getErrorMessage } from '../../../lib/api';
import { useApiQuery, list } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import type { DataObject } from '../../../types';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const result = useApiQuery<unknown>('notifications', '/notifications');
  const notifications = list<DataObject>(result.data, 'notifications');
  const visible = notifications.filter((notification) => filter === 'All' || (!notification.readAt && !notification.isRead));

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  }

  async function markRead(notification: DataObject) {
    if (!notification.id || notification.readAt || notification.isRead) return;
    try {
      await api.patch(`/notifications/${notification.id}`);
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      window.alert(getErrorMessage(error));
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
      <div className="filter-tabs notification-filters">
        {['All', 'Unread'].map((name) => (
          <button
            className={filter === name ? 'filter-active' : ''}
            onClick={() => setFilter(name)}
            key={name}
          >
            {name}
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
