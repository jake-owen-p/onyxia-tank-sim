import { h, button } from './overlay.js';

export function accountScreen({ account, onBack, onSuccess, reason = '', recovery = false, signup = false }) {
  let mode = recovery ? 'password' : signup ? 'signup' : 'login', busy = false;
  const panel = h('div', { class: 'panel panel-account' });
  function render(message = '') {
    panel.replaceChildren();
    const email = h('input', { type: 'email', autocomplete: 'email', required: true, maxlength: 254, autofocus: true, placeholder: 'you@example.com' });
    const password = h('input', { type: 'password', autocomplete: mode === 'login' ? 'current-password' : 'new-password', required: true, minlength: 8, maxlength: 128 });
    const feedback = h('p', { class: 'account-feedback', role: 'status', 'aria-live': 'polite', text: message });
    const title = { login: 'Sign in', signup: 'Create an account', reset: 'Reset your password', password: 'Choose a new password' }[mode];
    const intro = { login: reason || 'Sign in to play every raid and see your saved runs.', signup: 'An account is free. It lets you play every raid and save your runs.', reset: 'Enter the email address you used for your account.', password: 'Use at least 8 characters for your new password.' }[mode];
    const submit = h('button', { class: 'btn btn-primary', type: 'submit', text: { login: 'Sign in', signup: 'Create account', reset: 'Send reset link', password: 'Save password' }[mode] });
    const form = h('form', { class: 'account-form' },
      mode !== 'password' ? h('label', {}, 'Email', email) : null,
      mode !== 'reset' ? h('label', {}, 'Password', password, mode !== 'login' ? h('span', { class: 'muted', text: 'At least 8 characters' }) : null) : null,
      feedback, submit);
    form.addEventListener('submit', async e => {
      e.preventDefault(); if (busy) return;
      busy = true; submit.disabled = true; feedback.textContent = { login: 'Signing in…', signup: 'Creating account…', reset: 'Sending reset link…', password: 'Saving password…' }[mode];
      try {
        if (mode === 'login') { await account.signIn(email.value.trim(), password.value); onSuccess(); }
        else if (mode === 'signup') { if (await account.signUp(email.value.trim(), password.value)) onSuccess(); else feedback.textContent = 'Check your inbox for the confirmation link to finish signing up.'; }
        else if (mode === 'reset') { await account.resetPassword(email.value.trim()); feedback.textContent = 'If that email has an account, we’ll send a password reset link.'; }
        else { await account.updatePassword(password.value); onSuccess(); }
      } catch (err) { feedback.textContent = accountError(err); }
      finally { busy = false; submit.disabled = false; }
    });
    panel.append(h('header', { class: 'panel-head' }, h('div', {}, h('div', { class: 'kicker', text: 'Raid Rehearsal' }), h('h2', { text: title })), button('Back', onBack)),
      h('p', { class: 'muted', text: intro }),
      form, h('div', { class: 'actions' },
        mode === 'login' ? button('Create account', () => { mode = 'signup'; render(); }) : button('Sign in', () => { mode = 'login'; render(); }),
        mode === 'login' ? button('Forgot password?', () => { mode = 'reset'; render(); }) : null),
      h('p', { class: 'account-guest-note', text: 'You can play Onyxia without signing in.' }));
    if (!account.state.enabled) { submit.disabled = true; feedback.textContent = account.state.error || 'Sign-in isn’t working right now. You can still play Onyxia.'; }
  }
  render(); return panel;
}

function accountError(error) {
  const messages = {
    invalid_credentials: 'That email and password don’t match. Check them and try again.',
    email_not_confirmed: 'Open the confirmation link in your email, then sign in.',
    email_address_not_authorized: 'Sign-up emails aren’t set up yet. You can still play Onyxia.',
    over_email_send_rate_limit: 'Too many emails have been requested. Wait a few minutes before trying again.',
    over_request_rate_limit: 'Too many attempts. Wait a few minutes before trying again.',
    user_already_exists: 'There’s already an account with that email. Try signing in or resetting your password.',
    same_password: 'Choose a password you haven’t used for this account.',
    weak_password: 'Choose a stronger password with at least 8 characters.',
  };
  return messages[error.code] || (error.name === 'TypeError' ? 'Couldn’t connect. Check your connection and try again.' : error.message) || 'Something went wrong. Please try again.';
}
