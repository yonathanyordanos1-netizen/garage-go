import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from './theme';

export type IconName =
  | 'wrench' | 'car' | 'users' | 'bolt' | 'truck' | 'battery' | 'tire'
  | 'check' | 'clock' | 'heart' | 'wallet' | 'help' | 'gear' | 'home'
  | 'bag' | 'user' | 'chat' | 'chevL' | 'chevR' | 'mail' | 'lock'
  | 'eye' | 'eyeoff' | 'apple' | 'pin' | 'bell' | 'search' | 'filter'
  | 'star' | 'shield' | 'birr' | 'phone';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

// Stroked icons: rendered with stroke=color, fill=none.
// Filled icons (star, apple, birr): rendered with fill=color.
const FILLED: IconName[] = ['star', 'apple', 'birr'];

export function Icon({ name, size = 20, color = colors.ink2, strokeWidth = 1.9 }: Props) {
  const stroke = FILLED.includes(name) ? 'none' : color;
  const fill = FILLED.includes(name) ? color : 'none';
  const p = (d: string, extra: object = {}) => (
    <Path d={d} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" {...extra} />
  );
  const body = () => {
    switch (name) {
      case 'wrench':
        return p('M14.7 6.3a4 4 0 0 1-5.2 5.2L5 16v3h3l4.5-4.5a4 4 0 0 0 5.2-5.2l-2.3 2.3-2.2-.5-.5-2.2 2.3-2.3z');
      case 'car':
        return (<>
          {p('M4 13l1.4-4.2A2 2 0 0 1 7.3 7.5h9.4a2 2 0 0 1 1.9 1.3L20 13M4 13h16v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.5h-9V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z')}
          <Circle cx={7.5} cy={15.5} r={1} fill={color} />
          <Circle cx={16.5} cy={15.5} r={1} fill={color} />
        </>);
      case 'users':
        return (<>
          <Circle cx={9} cy={8} r={3} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M3.5 19a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M17 19a5.4 5.4 0 0 0-2-4.2')}
        </>);
      case 'bolt':
        return p('M13 3 5 13h5l-1 8 8-10h-5l1-8z');
      case 'truck':
        return (<>
          {p('M3 7h10v9H3zM13 10h4l3 3v3h-7zM3 16h10')}
          <Circle cx={7} cy={18} r={1.6} stroke={color} strokeWidth={strokeWidth} fill="none" />
          <Circle cx={16.5} cy={18} r={1.6} stroke={color} strokeWidth={strokeWidth} fill="none" />
        </>);
      case 'battery':
        return (<>
          <Rect x={3} y={8} width={15} height={9} rx={2} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M18 11h2v3h-2M7 12.5h3M8.5 11v3')}
        </>);
      case 'tire':
        return (<>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          <Circle cx={12} cy={12} r={3.4} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3')}
        </>);
      case 'check':
        return p('M5 12.5 10 17l9-10');
      case 'clock':
        return (<>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M12 7.5V12l3 2')}
        </>);
      case 'heart':
        return p('M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7-.3C19 12.6 12 20 12 20z');
      case 'wallet':
        return (<>
          <Rect x={3.5} y={6} width={17} height={13} rx={2.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M3.5 10h17M16.5 13.5h1.5')}
        </>);
      case 'help':
        return (<>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M9.6 9.4a2.4 2.4 0 0 1 4.6.9c0 1.6-2.2 1.9-2.2 3.4M12 17h.01')}
        </>);
      case 'gear':
        return (<>
          <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M12 2.5v2.3M12 19.2v2.3M4.4 7l2 1.1M17.6 15.9l2 1.1M4.4 17l2-1.1M17.6 8.1l2-1.1')}
        </>);
      case 'home':
        return p('M4 11 12 4l8 7M6 9.5V19h12V9.5');
      case 'bag':
        return p('M6 8h12l-1 11H7L6 8zM9 8V6.5a3 3 0 0 1 6 0V8');
      case 'user':
        return (<>
          <Circle cx={12} cy={8.5} r={3.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M5.5 19.5a6.5 6.5 0 0 1 13 0')}
        </>);
      case 'chat':
        return p('M4.5 6.5h15v10h-9l-4 3v-3h-2z');
      case 'chevL':
        return p('M14.5 6 8.5 12l6 6');
      case 'chevR':
        return p('M9.5 6l6 6-6 6');
      case 'mail':
        return (<>
          <Rect x={3.5} y={6} width={17} height={12} rx={2.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('m4.5 7.5 7.5 5 7.5-5')}
        </>);
      case 'lock':
        return (<>
          <Rect x={5} y={10.5} width={14} height={9.5} rx={2.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('M8 10.5V8a4 4 0 0 1 8 0v2.5')}
        </>);
      case 'eye':
        return (<>
          {p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z')}
          <Circle cx={12} cy={12} r={2.6} stroke={color} strokeWidth={strokeWidth} fill="none" />
        </>);
      case 'eyeoff':
        return p('M4 4l16 16M9.9 5.9A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4M6.3 8.2A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3-.5M9.8 9.8a3 3 0 0 0 4.4 4.4');
      case 'apple':
        return (<>
          <Path d="M15.8 12.4c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7A3.9 3.9 0 0 0 5.7 10c-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-1 2.4-2a8.8 8.8 0 0 0 1.1-2.2c-.1 0-2.1-.8-2.1-3.2z" fill={color} />
          <Path d="M14 6.6a3.5 3.5 0 0 0 .8-2.6 3.6 3.6 0 0 0-2.3 1.2 3.3 3.3 0 0 0-.8 2.5 3 3 0 0 0 2.3-1.1z" fill={color} />
        </>);
      case 'pin':
        return (<>
          {p('M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z')}
          <Circle cx={12} cy={10.5} r={2.4} stroke={color} strokeWidth={strokeWidth} fill="none" />
        </>);
      case 'bell':
        return p('M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5zM10 18.5a2 2 0 0 0 4 0');
      case 'search':
        return (<>
          <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
          {p('m16 16 4 4')}
        </>);
      case 'filter':
        return p('M4 6h16M7 12h10M10 18h4');
      case 'star':
        return <Path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4z" fill={color} />;
      case 'shield':
        return (<>
          {p('M12 3.5 19 6v5c0 4.6-3.1 7.6-7 9-3.9-1.4-7-4.4-7-9V6l7-2.5z')}
          {p('m9 12 2 2 4-4')}
        </>);
      case 'birr':
        return <Path d="M9 5.5h4.2a3.4 3.4 0 0 1 0 6.8H9zM9 12.3h4.6a3.6 3.6 0 0 1 0 6.2H9zM9 3.2v17.6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'phone':
        return p('M6 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z');
      default:
        return null;
    }
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>{body()}</G>
    </Svg>
  );
}
