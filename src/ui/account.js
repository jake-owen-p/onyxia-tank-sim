import { h, button } from './overlay.js';

export function accountScreen({ account, onBack, onSuccess, reason = '', recovery = false, signup = false }) {
  let mode = recovery ? 'password' : signup ? 'signup' : 'login', busy = false;
  const panel = h('div', { class: 'panel panel-account' });
  function render(message = '') {
    panel.replaceChildren();
    const email = h('input', { type: 'email', autocomplete: 'email', required: true, maxlength: 254, autofocus: true, placeholder: 'you@example.com' });
    const password = h('input', { type: 'password', autocomplete: mode === 'login' ? 'current-password' : 'new-password', required: true, minlength: 8, maxlength: 128 });
    const feedback = h('p', { class: 'account-feedback', role: 'status', 'aria-live': 'polite', text: message });
    const title = { login: 'Welcome back', signup: 'Create your account', reset: 'Reset your password', password: 'Choose a new password' }[mode];
    const submit = h('button', { class: 'btn btn-primary', type: 'submit', text: { login: 'Sign in', signup: 'Create account', reset: 'Send reset link', password: 'Save password' }[mode] });
    const form = h('form', { class: 'account-form' },
      mode !== 'password' ? h('label', {}, 'Email', email) : null,
      mode !== 'reset' ? h('label', {}, 'Password', password, mode !== 'login' ? h('span', { class: 'muted', text: 'At least 8 characters' }) : null) : null,
      feedback, submit);
    form.addEventListener('submit', async e => {
      e.preventDefault(); if (busy) return;
      busy = true; submit.disabled = true; feedback.textContent = 'Please wait…';
      try {
        if (mode === 'login') { await account.signIn(email.value.trim(), password.value); onSuccess(); }
        else if (mode === 'signup') { if (await account.signUp(email.value.trim(), password.value)) onSuccess(); else feedback.textContent = 'Check your email to confirm your account, then sign in here.'; }
        else if (mode === 'reset') { await account.resetPassword(email.value.trim()); feedback.textContent = 'If an account exists for that email, a password reset link is on its way.'; }
        else { await account.updatePassword(password.value); onSuccess(); }
      } catch (err) { feedback.textContent = err.message; }
      finally { busy = false; submit.disabled = false; }
    });
    panel.append(h('header', { class: 'panel-head' }, h('div', {}, h('div', { class: 'kicker', text: 'Raid Rehearsal' }), h('h2', { text: title })), button('Back', onBack)),
      h('p', { class: 'muted', text: reason || 'Sign in to play every raid and save your progress across devices.' }),
      form, h('div', { class: 'actions' },
        mode === 'login' ? button('Create account', () => { mode = 'signup'; render(); }) : button('Sign in', () => { mode = 'login'; render(); }),
        mode === 'login' ? button('Forgot password?', () => { mode = 'reset'; render(); }) : null),
      h('p', { class: 'account-guest-note', text: 'Onyxia is always free to play without an account.' }));
    if (!account.state.enabled) { submit.disabled = true; feedback.textContent = account.state.error || 'Sign-in is temporarily unavailable. Please try again shortly.'; }
  }
  render(); return panel;
}
