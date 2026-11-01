import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import SheetOverlay from './SheetOverlay';
import TextField from './TextField';

// One sheet for every "are you sure". A destructive confirm is red.
// With needReason the person must type why, and onConfirm gets the text.
export default function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  needReason = false,
  error = '',
  loading = false,
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('');
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!visible) {
      setReason('');
      setMissing(false);
    }
  }, [visible]);

  const confirm = () => {
    if (needReason) {
      const text = reason.trim();
      if (!text) {
        setMissing(true);
        return;
      }
      onConfirm(text);
      return;
    }
    onConfirm();
  };

  return (
    <SheetOverlay visible={visible} onClose={loading ? undefined : onCancel}>
      <Text style={[styles.title, !body && !needReason && styles.titleAlone]}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {needReason ? (
        <View style={styles.reason}>
          <TextField
            value={reason}
            onChangeText={(value) => {
              setReason(value);
              if (missing) setMissing(false);
            }}
            placeholder={missing ? 'A reason is required.' : 'Reason (required)'}
            accessibilityLabel="Reason"
            style={missing ? styles.reasonMissing : undefined}
          />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <View style={styles.action}>
          <SecondaryButton label={cancelLabel} onPress={onCancel} disabled={loading} />
        </View>
        <View style={styles.action}>
          <PrimaryButton label={confirmLabel} danger={danger} loading={loading} onPress={confirm} />
        </View>
      </View>
    </SheetOverlay>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.title,
    lineHeight: 36,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  titleAlone: {
    marginBottom: theme.spacing.xxl,
  },
  body: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.input,
    lineHeight: theme.lineHeight.body,
    color: theme.colors.text2,
    marginBottom: theme.spacing.xxl,
  },
  reason: {
    marginBottom: theme.spacing.lg,
  },
  reasonMissing: {
    borderColor: theme.colors.red,
  },
  error: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.red,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
