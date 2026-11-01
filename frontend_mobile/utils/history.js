import { formatDate, formatPkr } from './format';
import { txnStatusLabel, txnStatusVariant } from './orderRules';
import { amountOwed } from './settlement';

// What a closed order row shows. role is 'requester' or 'holder'.
export function historyRow(txn, role) {
  const holder = role === 'holder';
  const person = holder ? txn.requester_name : txn.card_holder_name;
  const paid = txn.txn_status === 'paid';
  const amount = paid ? (amountOwed(txn) ?? txn.order_amount) : txn.order_amount;
  return {
    id: txn.id,
    title: txn.merchant,
    subtitle: [person || (holder ? 'Someone' : 'Card holder'), formatPkr(amount), formatDate(txn.created_at)]
      .filter(Boolean)
      .join(' · '),
    badgeLabel: txnStatusLabel(txn.txn_status, role, person),
    badgeVariant: txnStatusVariant(txn.txn_status),
    nav: { screen: 'order', params: { txnId: txn.id, role } },
  };
}
