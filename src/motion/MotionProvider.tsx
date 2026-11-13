import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

// Motion's animation features load in their own chunk, so the first paint only pays for `m`.
const loadFeatures = () => import('./features').then((mod) => mod.default);

/**
 * App-wide Motion setup. Components use `m.*` (never `motion.*`), and every
 * Motion animation follows the device's reduce-motion setting.
 */
const MotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user">
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  </MotionConfig>
);

export default MotionProvider;
