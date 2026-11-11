import { h } from './overlay.js';
import { bossPortrait, abilityIcon } from './art.js';

export const playUrl = (raid, boss) => raid && boss ? `/play?raid=${encodeURIComponent(raid)}&boss=${encodeURIComponent(boss)}` : '/play';
const link = (text, href, className = '') => h('a', { href, class: className, 'data-route': '' }, text);

export function landingScreen({ index, account, history }) {
  const raids = index.raids.filter(r => r.bosses.some(b => b.status === 'ready'));
  const count = raids.reduce((n,r) => n+r.bosses.filter(b => b.status === 'ready').length, 0);
  const steps = [
    ['taunt', 'Pick your role', 'Tank, off-tank, melee, ranged or healer. Each role has its own jobs and scoring.'],
    ['attack', 'Try the fight', 'Start with Onyxia’s tutorial, or jump into a full fight. Drills let you repeat a single mechanic.'],
    ['heal', 'Check your run', 'See which mechanics you missed and where you reacted late. Watch the replay, then give it another go.'],
  ];
  return h('div', { class: 'landing' },
    h('a', { href: '#landing-main', class: 'skip-link' }, 'Skip to content'),
    h('header', { class: 'site-header' },
      link(h('span', { class: 'site-brand' }, abilityIcon('taunt', 29), h('span', { text: 'Raid Rehearsal' })), '/', 'site-brand-link'),
      h('nav', { 'aria-label': 'Main navigation' },
        h('a', { href: '#how-it-works' }, 'How it works'), h('a', { href: '#raids' }, 'Raids'),
        link(account.user ? 'Run history' : 'Sign in', account.user ? '/history' : '/account'),
        link('Choose a boss', '/play', 'btn btn-primary'))),
    h('main', { id: 'landing-main' },
      h('section', { class: 'landing-hero', 'aria-labelledby': 'landing-title' },
        h('div', { class: 'landing-copy', 'data-hero-inset': '' },
          h('p', { class: 'landing-eyebrow', text: 'WoW Classic raid simulator' }),
          h('h1', { id: 'landing-title', tabindex: -1, autofocus: true }, 'Get a few pulls in', h('br'), h('span', { text: 'before raid night.' })),
          h('p', { class: 'landing-intro', text: 'Pick a boss and practice your role. Pause when you need to, slow the fight down, and try again until the mechanics make sense.' }),
          h('div', { class: 'landing-actions' }, link('Try Onyxia', playUrl('onyxia','onyxia'), 'btn btn-primary landing-primary'), h('a', { href: '#raids', class: 'landing-secondary' }, 'Browse raids →')),
          h('p', { class: 'landing-no-account', text: 'Free to play. No account or download needed.' }),
          h('div', { class: 'landing-stats' }, ...[[count,'encounters'],[raids.length,'Classic raids'],[5,'roles']].map(([n,label]) => h('div', {}, h('strong', { text: String(n) }), h('span', { text: label }))))),
        h('div', { class: 'hero-caption', 'aria-hidden': 'true' }, h('span', { text: 'Try the first encounter' }), h('strong', { text: 'Onyxia’s Lair' }), h('span', { text: 'Mind the tail.' }))),
      h('div', { class: 'landing-content' },
        h('section', { id: 'how-it-works', class: 'landing-section' },
          h('p', { class: 'landing-eyebrow', text: 'How it works' }), h('h2', { text: 'Start with a boss you want to learn.' }),
          h('div', { class: 'learning-steps' }, ...steps.map(([icon,title,body],i) => h('article', {},
            h('div', { class: 'step-top' }, abilityIcon(icon, 35), h('span', { text: `0${i+1}` })), h('h3', { text: title }), h('p', { text: body }))))),
        h('section', { id: 'raids', class: 'landing-section' },
          h('div', { class: 'raid-section-heading' }, h('div', {}, h('p', { class: 'landing-eyebrow', text: 'Available raids' }), h('h2', { text: 'Choose a raid.' })), h('p', { text: 'Play Onyxia without signing in. A free account gives you access to every raid.' })),
          h('div', { class: 'raid-collection' }, ...raids.map(raid => {
            const boss = raid.bosses.find(b => b.status === 'ready'), open = raid.id === 'onyxia';
            return link(h('div', { class: 'raid-card-content' }, bossPortrait(raid.id,boss.id,64), h('div', { class: 'raid-card-copy' },
              h('span', { class: 'raid-card-tag', text: open ? 'No sign-in needed' : account.user ? 'Choose a boss' : 'Sign in to play' }),
              h('h3', { text: raid.name }), h('span', { class: 'raid-card-meta', text: `${raid.bosses.filter(b => b.status === 'ready').length} ${raid.bosses.length === 1 ? 'encounter' : 'encounters'} · ${raid.size} player raid` })), h('span', { class: 'raid-card-arrow', 'aria-hidden': 'true', text: '↗' })), playUrl(raid.id,boss.id), `raid-card${open ? ' raid-card-featured' : ''}`);
          }))),
        h('section', { class: 'landing-save' },
          h('div', {}, h('p', { class: 'landing-eyebrow', text: 'Saved progress' }), h('h2', { text: account.user ? 'Your saved runs' : 'Save your runs.' }),
            h('p', { text: account.user ? (history.runs.length ? `${history.runs.length} recent ${history.runs.length === 1 ? 'run' : 'runs'} saved. You can find your scores in Run history.` : 'Finish a drill or a full fight and your score will appear in Run history.') : 'Your account keeps your last 50 runs, best scores and tutorial progress. Your settings and keybinds carry over when you sign in on another device.' })),
          link(account.user ? 'Back to raids' : 'Create account', account.user ? '/play' : '/account?mode=signup', 'btn btn-primary landing-primary')))),
    h('footer', { class: 'site-footer' }, h('span', { text: 'Raid Rehearsal' }), h('span', { text: 'WoW Classic encounter practice' }), h('nav', { 'aria-label': 'Footer navigation' }, link('Choose a boss', '/play'), link('Settings', '/settings'), link('Run history', '/history'))));
}
