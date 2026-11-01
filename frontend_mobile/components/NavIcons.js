import Svg, { Circle, Path, Rect } from 'react-native-svg';

// The side-panel glyph: a rounded square with a divider near the left edge.
export function PanelIcon({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke={color} strokeWidth="2" />
      <Path d="M9.5 3.5v17" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function ChatIcon({ color, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H9l-5 4V5z" stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
    </Svg>
  );
}

export function NavIcon({ name, color }) {
  if (name === 'home') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
        <Path d="M7 12h10M12 7v10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'circle') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.8" />
        <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M16 6c1.7 0 3 1.3 3 3s-1.3 3-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M18 17c1.7.6 3 2.3 3 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'request') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8" />
        <Path d="M7 9h10M7 13h7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 8v4l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M3.05 11a9 9 0 1 0 .49-3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M3 4v4h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
