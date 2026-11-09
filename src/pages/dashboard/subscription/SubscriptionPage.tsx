import { ShieldCheck } from 'lucide-react';
import { useApiQuery, list } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice } from '../../../components/common';
import type { DataObject } from '../../../types';

export function SubscriptionPage() {
  const plansQuery = useApiQuery<unknown>('subscription-plans', '/subscriptions/plans');
  const subscriptionQuery = useApiQuery<DataObject>('subscription', '/subscriptions');
  const plans = list<DataObject>(plansQuery.data, 'plans');
  const subscription = subscriptionQuery.data || {};
  const planName = subscription.plan ? String(subscription.plan).toUpperCase() : '—';

  return (
    <div className="narrow-page">
      <PageTitle
        eyebrow="YOUR STUDY PLAN"
        title="Subscription"
        subtitle="View your current plan and available options."
      />
      <QueryNotice error={plansQuery.error || subscriptionQuery.error} />
      <div className="subscription-card">
        <span className="plan-badge">
          <ShieldCheck size={14} /> CURRENT PLAN
        </span>
        <h2>{planName}</h2>
        <p>
          {subscription.isActive === true
            ? 'Your subscription is active.'
            : subscription.isActive === false
            ? 'Your subscription is not active.'
            : 'Subscription status is unavailable.'}
        </p>
        {subscription.expiresAt != null && (
          <div className="plan-feature">
            Expires {new Date(String(subscription.expiresAt)).toLocaleDateString()}
          </div>
        )}
        {plans.length ? (
          plans.map((plan, index) => (
            <div className="plan-feature" key={String(plan.id || plan.name || index)}>
              <b>{String(plan.name || plan.title || 'Plan')}</b>
              {plan.description != null && <span> · {String(plan.description)}</span>}
            </div>
          ))
        ) : (
          !plansQuery.error && (
            <div className="subscription-coming">
              No purchasable plans are available right now.
            </div>
          )
        )}
      </div>
    </div>
  );
}
