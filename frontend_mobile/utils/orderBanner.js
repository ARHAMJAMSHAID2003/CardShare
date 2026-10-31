import { formatPkr } from './format';
import { isYourTurn } from './requestInbox';

export function itemsForMode(items, mode) {
  const role = mode === 'holder' ? 'holding' : 'asked';
  return items.filter((item) => item.role === role);
}

export function sortBannerItems(items) {
  return [...items].sort((a, b) => {
    const turn = Number(isYourTurn(b)) - Number(isYourTurn(a));
    if (turn) return turn;
    return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
  });
}

export function bannerText(item) {
  const name = item.personName || 'Someone';
  const store = item.title || 'Order';
  const amount = formatPkr(item.amount);
  if (item.role === 'asked') {
    if (item.status === 'pending') return `Waiting for ${name} to accept · ${store} ${amount}`;
    if (item.status === 'accepted') return `Waiting for ${name} to buy · ${store} ${amount}`;
    if (item.status === 'proof_submitted') return `${name} sent proof · ${store}`;
    if (item.status === 'unpaid') return `Pay ${name} · ${store} ${amount}`;
  }
  if (item.role === 'holding') {
    if (item.status === 'pending') return `${name} wants ${store} (${amount})`;
    if (item.status === 'accepted') return `Upload proof · ${store} for ${name}`;
    if (item.status === 'proof_submitted') return `Waiting for ${name} · ${store}`;
    if (item.status === 'unpaid') return `${name} owes you · ${store}`;
  }
  return `${store} · ${amount}`;
}
