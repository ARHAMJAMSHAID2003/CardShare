import { asList, formatPkr } from './format';
import { amountOwed } from './settlement';

// Whose move it is. These rows sit under "Needs you" and light the nav dot.
export function isYourTurn(item) {
  if (item.role === 'holding') {
    return item.status === 'pending' || item.status === 'accepted' || item.status === 'unpaid';
  }
  if (item.role === 'asked') return item.status === 'proof_submitted' || item.status === 'unpaid';
  return false;
}

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

// Row badge: text and colour for each step, from the point of view of the viewer.
function badgeFor(role, status, first) {
  if (role === 'asked') {
    if (status === 'pending') return { label: 'Awaiting accept', variant: 'blue' };
    if (status === 'accepted') return { label: 'Buying it', variant: 'blue' };
    if (status === 'proof_submitted') return { label: 'Review proof', variant: 'amber' };
    if (status === 'unpaid') return { label: first ? `Pay ${first}` : 'Pay', variant: 'amber' };
  } else {
    if (status === 'pending') return { label: 'Accept?', variant: 'amber' };
    if (status === 'accepted') return { label: 'Upload proof', variant: 'amber' };
    if (status === 'proof_submitted') return { label: 'Under review', variant: 'blue' };
    if (status === 'unpaid') return { label: 'Mark received', variant: 'amber' };
  }
  return { label: '', variant: 'gray' };
}

function subtitleFor(role, status, first, amount, owed) {
  const money = owed != null && (status === 'proof_submitted' || status === 'unpaid');
  if (money) {
    return role === 'asked'
      ? `${first} · you pay ${formatPkr(owed)}`
      : `${first} · you receive ${formatPkr(owed)}`;
  }
  return `${first} · ${formatPkr(amount)}`;
}

function build(item, { role, status, personName, kind }) {
  const first = firstName(personName) || (role === 'asked' ? 'them' : 'Someone');
  const owed = amountOwed(item);
  const badge = badgeFor(role, status, first);
  return {
    key: `${kind}-${item.id}`,
    role,
    status,
    updatedAt: item.updated_at || item.created_at,
    title: item.merchant,
    personName: personName || first,
    firstName: first,
    amount: item.order_amount,
    owed,
    bankName: item.bank_name || '',
    cardTier: item.card_tier || '',
    subtitle: subtitleFor(role, status, first, item.order_amount, owed),
    badge: badge.label,
    badgeVariant: badge.variant,
    id: item.id,
    unreadCount: Number(item.unread_count) || 0,
    nav: kind === 'txn-asked'
      ? { screen: 'order', params: { txnId: item.id, role: 'requester' } }
      : kind === 'txn-hold'
        ? { screen: 'order', params: { txnId: item.id, role: 'holder' } }
        : kind === 'asked'
          ? { screen: 'order', params: { requestId: item.id } }
          : { screen: 'order', params: { orderId: item.id } },
  };
}

function askedItem(item) {
  return build(item, {
    role: 'asked',
    status: item.rq_status,
    personName: item.card_holder_name,
    kind: 'asked',
  });
}

function holdingItem(item, status) {
  return build(item, {
    role: 'holding',
    status,
    personName: item.requester_name,
    kind: 'hold',
  });
}

function unpaidAskedItem(item) {
  return build(item, {
    role: 'asked',
    status: 'unpaid',
    personName: item.card_holder_name,
    kind: 'txn-asked',
  });
}

function unpaidHoldingItem(item) {
  return build(item, {
    role: 'holding',
    status: 'unpaid',
    personName: item.requester_name,
    kind: 'txn-hold',
  });
}

export function buildRequestItems(sent, incoming, holding, unpaidAsked, unpaidHolding) {
  const items = [];
  if (sent.status === 'fulfilled') {
    items.push(...asList(sent.value).map(askedItem));
  }
  if (incoming.status === 'fulfilled') {
    items.push(...asList(incoming.value).map((item) => holdingItem(item, 'pending')));
  }
  if (holding.status === 'fulfilled') {
    items.push(...asList(holding.value).map((item) => holdingItem(item, item.rq_status)));
  }
  if (unpaidAsked?.status === 'fulfilled') {
    items.push(...asList(unpaidAsked.value).map(unpaidAskedItem));
  }
  if (unpaidHolding?.status === 'fulfilled') {
    items.push(...asList(unpaidHolding.value).map(unpaidHoldingItem));
  }
  items.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

  const core = [sent, incoming, holding];
  const failed = [...core, unpaidAsked, unpaidHolding].filter((result) => result?.status === 'rejected');
  const coreFailed = core.filter((result) => result.status === 'rejected');
  let error = '';
  if (coreFailed.length === 3) {
    error = coreFailed[0].reason?.message || 'Could not load requests.';
  } else if (failed.length) {
    error = 'Some requests could not be loaded.';
  }
  return { items, error, failedAll: coreFailed.length === 3 };
}

export function unreadTotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.unreadCount) || 0), 0);
}
