// IconSet — single re-export surface for the app's SVG icon set.
//
// The icons themselves live in `lib/icons.tsx` as one <Icon name="…"/> component
// (react-native-svg, outlined, stroke = currentColor, 24×24 viewBox). This file
// re-exports it plus a couple of named convenience wrappers so screens/navigators
// can import from a stable "IconSet" module.
//
// The Garage icon (garage-door + service line motif) was added to match the set;
// its standalone source is in `assets/icons/Garage.svg`.
import React from 'react';
import { Icon, IconName } from '../lib/icons';

export { Icon };
export type { IconName };

type WrapProps = { size?: number; color?: string; strokeWidth?: number };

export const GarageIcon = (p: WrapProps) => <Icon name="garage" {...p} />;
export const HomeIcon = (p: WrapProps) => <Icon name="home" {...p} />;
export const MechanicIcon = (p: WrapProps) => <Icon name="users" {...p} />;
export const BagIcon = (p: WrapProps) => <Icon name="bag" {...p} />;
export const UserIcon = (p: WrapProps) => <Icon name="user" {...p} />;
