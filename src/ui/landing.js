import { h } from './overlay.js';
import { bossPortrait, abilityIcon } from './art.js';

export const playUrl = (raid, boss) => raid && boss ? `/play?raid=${encodeURIComponent(raid)}&boss=${encodeURIComponent(boss)}` : '/play';
const link = (text, href, className = '') => h('a', { href, class: className, 'data-route': '' }, text);

export function landingScreen({ index, account, history }) {
  const raids = index.raids.filter(r => r.bosses.some(b => b.status === 'ready'));
  const count = raids.reduce((n,r) => n+r.bosses.filter(b => b.status === 'ready').length, 0);
  const steps = [
    ['taunt', 'Choose your role', 'Tank, healer or DPS. Learn the positioning and decisions your role needs to get right.'],
    ['attack', 'Rehearse the mechanic', 'Start with a guided tutorial, repeat a focused drill, or take on the full encounter.'],
    ['heal', 'Make the next pull better', 'Review your score, replay your run and work on the moments that need another try.'],
  ];
  return h('div', { class: 'landing' },
    h('a', { href: '#landing-main', class: 'skip-link' }, 'Skip to content'),
    h('header', { class: 'site-header' },
      link(h('span', { class: 'site-brand' }, abilityIcon('taunt', 29), h('span', { text: 'Raid Rehearsal' })), '/', 'site-brand-link'),
      h('nav', { 'aria-label': 'Main navigation' },
        h('a', { href: '#how-it-works' }, 'How it works'), h('a', { href: '#raids' }, 'Raids'),
        link(account.user ? 'Your progress' : 'Sign in', account.user ? '/history' : '/account'),
        link('Enter the game', '/play', 'btn btn-primary'))),
    h('main', { id: 'landing-main' },
      h('section', { class: 'landing-hero', 'aria-labelledby': 'landing-title' },
        h('div', { class: 'landing-copy', 'data-hero-inset': '' },
          h('p', { class: 'landing-eyebrow', text: 'WoW Classic raid practice' }),
          h('h1', { id: 'landing-title', tabindex: -1, autofocus: true }, 'Learn the fight.', h('br'), h('span', { text: 'Before the pull.' })),
          h('p', { class: 'landing-intro', text: 'Practice positioning, threat and timing as a tank, healer or DPS. Build confidence one pull at a time.' }),
          h('div', { class: 'landing-actions' }, link('Play Onyxia free', playUrl('onyxia','onyxia'), 'btn btn-primary landing-primary'), h('a', { href: '#raids', class: 'landing-secondary' }, 'Explore the raids →')),
          h('p', { class: 'landing-no-account', text: 'No download. No account needed for Onyxia.' }),
          h('div', { class: 'landing-stats' }, ...[[count,'encounters'],[raids.length,'Classic raids'],[5,'roles']].map(([n,label]) => h('div', {}, h('strong', { text: String(n) }), h('span', { text: label }))))),
        h('div', { class: 'hero-caption', 'aria-hidden': 'true' }, h('span', { text: 'Your first rehearsal' }), h('strong', { text: 'Onyxia’s Lair' }), h('span', { text: 'Position. Hold threat. Survive the breath.' }))),
      h('div', { class: 'landing-content' },
        h('section', { id: 'how-it-works', class: 'landing-section' },
          h('p', { class: 'landing-eyebrow', text: 'A better way to prepare' }), h('h2', { text: 'Practice the moments that matter.' }),
          h('div', { class: 'learning-steps' }, ...steps.map(([icon,title,body],i) => h('article', {},
            h('div', { class: 'step-top' }, abilityIcon(icon, 35), h('span', { text: `0${i+1}` })), h('h3', { text: title }), h('p', { text: body }))))),
        h('section', { id: 'raids', class: 'landing-section' },
          h('div', { class: 'raid-section-heading' }, h('div', {}, h('p', { class: 'landing-eyebrow', text: 'The encounter collection' }), h('h2', { text: 'From Onyxia to Naxxramas.' })), h('p', { text: 'Try Onyxia now. A free account unlocks the rest.' })),
          h('div', { class: 'raid-collection' }, ...raids.map(raid => {
            const boss = raid.bosses.find(b => b.status === 'ready'), open = raid.id === 'onyxia';
            return link(h('div', { class: 'raid-card-content' }, bossPortrait(raid.id,boss.id,64), h('div', { class: 'raid-card-copy' },
              h('span', { class: 'raid-card-tag', text: open ? 'Play without an account' : account.user ? 'Ready to rehearse' : 'Free with an account' }),
              h('h3', { text: raid.name }), h('span', { class: 'raid-card-meta', text: `${raid.bosses.filter(b => b.status === 'ready').length} ${raid.bosses.length === 1 ? 'encounter' : 'encounters'} · ${raid.size} player raid` })), h('span', { class: 'raid-card-arrow', 'aria-hidden': 'true', text: '↗' })), playUrl(raid.id,boss.id), `raid-card${open ? ' raid-card-featured' : ''}`);
          }))),
        h('section', { class: 'landing-save' },
          h('div', {}, h('p', { class: 'landing-eyebrow', text: 'Keep getting better' }), h('h2', { text: account.user ? 'Your next personal best awaits.' : 'Your practice. Your progress.' }),
            h('p', { text: account.user ? `${history.runs.length ? `${history.runs.length} recent runs saved. ` : ''}Pick up where you left off, or rehearse a new encounter.` : 'Save your best scores, completed tutorials, settings and key bindings. Pick up your practice on another device.' })),
          link(account.user ? 'Continue practicing' : 'Create a free account', account.user ? '/play' : '/account?mode=signup', 'btn btn-primary landing-primary')))),
    h('footer', { class: 'site-footer' }, h('span', { text: 'Raid Rehearsal' }), h('span', { text: 'WoW Classic encounter practice' }), h('nav', { 'aria-label': 'Footer navigation' }, link('Play', '/play'), link('Settings', '/settings'), link('Your progress', '/history'))));
}
