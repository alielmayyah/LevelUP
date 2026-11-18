import { IonContent, IonPage } from '@ionic/react';
import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import CtaButton from '../components/CtaButton';
import Icon, { type IconName } from '../components/Icon';
import { useSwipe } from '../components/useSwipe';
import { formatNumber } from '../i18n/format';
import { markIntroSeen } from './intro/introSeen';
import './intro/Intro.scss';

type SlideKey = 'numbers' | 'meaning' | 'goals';

const SLIDES: SlideKey[] = ['numbers', 'meaning', 'goals'];

/** Each slide's picture: a few of the app's own pieces, drawn small, instead of stock photos. */
const Picture: React.FC<{ slide: SlideKey }> = ({ slide }) => {
  const { t } = useTranslation();
  if (slide === 'numbers') {
    const chips: [IconName, string, string][] = [
      ['muscle', 'lu-intro-muscle', t('intro.chip.muscle')],
      ['bodyFat', 'lu-intro-fat', t('intro.chip.fat')],
      ['drop', 'lu-intro-water', t('intro.chip.water')],
      ['bolt', 'lu-intro-energy', t('intro.chip.energy')],
    ];
    return (
      <ul className="m-0 grid w-full max-w-[300px] list-none gap-2.5 p-0">
        {chips.map(([icon, tone, label], i) => (
          <li
            key={icon}
            className={`lu-card flex items-center gap-3 px-3.5 py-2.5 ${tone}`}
            // Every other row steps in a little, so the stack reads as a loose fan of cards.
            style={{ marginInlineStart: `${(i % 2) * 28}px`, inlineSize: 'calc(100% - 28px)' }}
          >
            <span className="lu-intro-badge grid size-9 flex-none place-items-center rounded-full text-[1.1rem]">
              <Icon name={icon} />
            </span>
            <span className="font-semibold text-ink">{label}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (slide === 'meaning')
    return (
      <div className="grid w-full max-w-[300px] gap-3 text-start">
        <div className="lu-card grid gap-1.5 p-4">
          <span className="lu-card-kicker">{t('intro.demo.muscle')}</span>
          <span className="lu-display text-[1.8rem] leading-none text-ink">
            {formatNumber(41.3, 1)} <span className="text-[0.55em] text-muted">{t('units.kg')}</span>
          </span>
          <svg
            className="lu-intro-spark block h-10 w-full"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points="2,26 20,22 38,20 56,14 74,11 98,4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="lu-card flex items-start gap-3 p-3.5">
          <span className="lu-intro-badge lu-intro-good grid size-9 flex-none place-items-center rounded-full text-[1.1rem]">
            <Icon name="sparkles" />
          </span>
          <span className="grid gap-0.5">
            <strong className="text-ink">{t('intro.demo.insightTitle')}</strong>
            <span className="text-[0.85rem] text-muted">{t('intro.demo.insightBody')}</span>
          </span>
        </div>
      </div>
    );
  return (
    <div className="grid w-full max-w-[300px] grid-cols-[1fr_auto] items-center gap-3 text-start">
      <div className="lu-card grid gap-2 p-4">
        <span className="lu-card-kicker">{t('intro.demo.goal')}</span>
        <strong className="text-ink">{t('intro.demo.goalTitle')}</strong>
        <span className="lu-bar">
          <span style={{ '--lu-bar': '67%' } as CSSProperties} />
        </span>
      </div>
      <span className="lu-intro-medal grid size-20 place-items-center rounded-full text-[2.2rem]">
        <Icon name="trophy" />
      </span>
    </div>
  );
};

/**
 * First-launch intro: three short slides on what the app does, before sign-in.
 * Skip or Get started both go to Login, and the slides never show again.
 */
const Intro: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const finish = () => {
    void markIntroSeen();
    history.replace('/login');
  };
  const next = () => (last ? finish() : setIndex(index + 1));
  const swipe = useSwipe({
    onNext: () => setIndex((i) => Math.min(SLIDES.length - 1, i + 1)),
    onPrev: () => setIndex((i) => Math.max(0, i - 1)),
    rtl: i18n.dir() === 'rtl',
  });

  return (
    <IonPage data-testid="page-intro">
      <IonContent>
        <div className="lu-tab-body box-border flex min-h-full flex-col px-5 pt-[calc(16px+var(--ion-safe-area-top,0px))] pb-[calc(20px+var(--ion-safe-area-bottom,0px))]">
          <div className="flex min-h-11 justify-end">
            {!last && (
              <button type="button" className="lu-link-button" onClick={finish} data-testid="intro-skip">
                {t('intro.skip')}
              </button>
            )}
          </div>
          <section
            ref={swipe}
            className="mx-auto grid w-full max-w-[420px] flex-1 content-center justify-items-center gap-8 py-4 text-center"
            aria-roledescription={t('intro.slide')}
            aria-label={t('intro.position', { n: formatNumber(index + 1), total: formatNumber(SLIDES.length) })}
            data-testid={`intro-slide-${slide}`}
          >
            <div key={slide} className="lu-intro-picture grid w-full justify-items-center">
              <Picture slide={slide} />
            </div>
            <div className="grid gap-2" aria-live="polite">
              <h1 className="lu-display m-0 text-[clamp(1.6rem,7vw,2.1rem)] leading-tight text-ink">
                {t(`intro.${slide}.title`)}
              </h1>
              <p className="m-0 text-[1rem] leading-relaxed text-muted">{t(`intro.${slide}.body`)}</p>
            </div>
          </section>
          <div className="mx-auto grid w-full max-w-[420px] gap-5">
            <div className="flex justify-center gap-2" aria-hidden="true">
              {SLIDES.map((s, i) => (
                <span key={s} className={`lu-intro-dot h-2 rounded-full ${i === index ? 'is-on w-6' : 'w-2'}`} />
              ))}
            </div>
            <CtaButton className="w-full" onClick={next} data-testid="intro-next">
              {last ? t('intro.start') : t('intro.next')}
            </CtaButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Intro;
