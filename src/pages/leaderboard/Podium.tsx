import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LeaderboardBoard, LeaderboardRow, Sex } from '../../api/types';
import Avatar from '../../avatar/Avatar';
import { formatNumber } from '../../i18n/format';
import MetricIcon from './MetricIcon';
import { rowAvatar } from './rowAvatar';

/** Visual order on the stage: 2nd on the start side, 1st in the middle, 3rd on the end side. */
const PLACE: Record<number, string> = {
  1: 'order-2',
  2: 'order-1',
  3: 'order-3',
};

/** Block height and character size per place, so 1st stands tallest. */
const BLOCK: Record<number, string> = {
  1: 'h-[44px]',
  2: 'h-[32px]',
  3: 'h-[24px]',
};
const FIGURE: Record<number, string> = {
  1: 'h-[clamp(80px,22vw,108px)]',
  2: 'h-[clamp(68px,18vw,92px)]',
  3: 'h-[clamp(68px,18vw,92px)]',
};

/** Pixel crown over 1st place. */
const Crown: React.FC = () => (
  <svg
    viewBox="0 0 14 9"
    className="lu-crown mx-auto mb-[-2px] block h-[18px] w-auto"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    <path className="lu-crown-ink" d="M0 1h3v1h1v1h1V1h1V0h2v1h1v2h1V2h1V1h3v8H0z" />
    <path className="lu-crown-gold" d="M1 2h1v1h1v1h2V2h1V1h2v1h1v2h2V3h1V2h1v6H1z" />
    <path className="lu-crown-gem" d="M6 5h2v2H6z" />
  </svg>
);

interface Props {
  rows: LeaderboardRow[];
  division: Sex;
  board: LeaderboardBoard;
  format: (value: number) => string;
  you: string;
  myRef: React.Ref<HTMLLIElement>;
}

/**
 * The top three on a dusk stage: characters on gold, silver, and bronze blocks.
 * In the DOM they stay in rank order (1, 2, 3) for screen readers; CSS order
 * puts 1st in the middle.
 */
const Podium: React.FC<Props> = ({ rows, division, board, format, you, myRef }) => {
  const { t } = useTranslation();
  return (
    <section className="lu-podium mb-3 px-3 pt-3 pb-0" aria-label={t('leaderboard.podium')}>
      <ol className="relative m-0 grid list-none grid-cols-3 items-end gap-1.5 p-0" data-testid="podium">
        {rows.map((r) => (
          <li
            key={r.memberId}
            ref={r.isMe ? myRef : undefined}
            className={`grid min-w-0 justify-items-center ${PLACE[r.rank] ?? ''}`}
            data-testid={r.isMe ? 'my-row' : 'podium-place'}
          >
            {r.rank === 1 && <Crown />}
            <Avatar config={rowAvatar(r, division)} crop="full" className={`lu-podium-figure block w-auto ${FIGURE[r.rank]}`} />
            <div className="lu-podium-base mt-[-4px] grid w-full">
              <div className={`lu-podium-block lu-medal-${r.rank} grid place-items-center ${BLOCK[r.rank]}`}>
                <span className="lu-display text-[1.3rem] leading-none">{formatNumber(r.rank)}</span>
              </div>
              <div className="lu-podium-info grid justify-items-center gap-0 px-1 pt-1 pb-1.5 text-center">
                <span className="flex max-w-full min-w-0 items-center gap-1 text-[0.8rem] font-extrabold">
                  <span className="truncate" dir="auto">
                    {r.name}
                  </span>
                </span>
                {r.isMe && <span className="lu-chip lu-chip-primary">{you}</span>}
                <span className="lu-display text-[1.3rem] leading-none whitespace-nowrap">{format(r.value)}</span>
                <MetricIcon board={board} className="mt-0.5 text-[18px]" />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="lu-podium-floor mx-[-12px] h-2.5" aria-hidden="true" />
    </section>
  );
};

export default memo(Podium);
