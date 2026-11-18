import type { ReactNode } from 'react';

import type { IconName } from '../Icon';
import FeedCard from './FeedCard';
import type { Tone } from './IconTile';

/**
 * Empty and error states in the card anatomy: what is missing or wrong in one
 * sentence, and one way forward (Retry, Book a scan). Never a blank card or 0.
 */
export function StateCard({
  icon,
  tone = 'neutral',
  title,
  message,
  action,
  testId,
}: {
  icon: IconName;
  tone?: Tone;
  title: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <FeedCard icon={icon} iconTone={tone} title={title} action={action} testId={testId}>
      <p className="m-0 text-body text-muted" role="status">
        {message}
      </p>
    </FeedCard>
  );
}

export default StateCard;
