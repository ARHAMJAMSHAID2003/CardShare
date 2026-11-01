import { StyleSheet, Text } from 'react-native';
import theme from '../constants/theme';
import { CircleEmpty } from './HomeParts';

function personName(member) {
  return member.contact_name || member.display_name || 'Someone';
}

// What a requester with no one in the circle yet sees. It also covers an
// invite that was sent or received but not accepted.
export default function CircleStart({ members, onAdd, onOpenCircle }) {
  const received = members.filter((member) => member.c_status === 'pending' && !member.is_sender);
  const sent = members.filter((member) => member.c_status === 'pending' && member.is_sender);
  const invited = received.length > 0;

  let title = 'Your circle is empty';
  let text = 'Add someone you trust. Once they accept, the cards they share show up here.';
  let button = 'Add someone';
  let onPress = onAdd;

  if (invited) {
    title = received.length === 1 ? `${personName(received[0])} invited you` : 'You have invites';
    button = received.length === 1 ? 'See invite' : 'See invites';
    onPress = onOpenCircle;
  } else if (sent.length) {
    title = 'Invite sent';
    text = '';
    button = 'Add someone else';
  }

  const names = (
    <>
      {invited && received.length > 1 ? received.map((member) => (
        <Text key={member.id} style={styles.person}>{personName(member)}</Text>
      )) : null}
      {sent.map((member) => (
        <Text key={member.id} style={styles.person}>
          {personName(member)} — waiting for them to accept.
        </Text>
      ))}
    </>
  );

  return (
    <CircleEmpty
      icon="circle"
      title={title}
      text={text}
      extra={names}
      button={button}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  person: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    lineHeight: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
