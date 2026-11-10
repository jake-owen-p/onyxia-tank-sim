import { abilityButtons } from '../render/action-bar.js';

/** Accessible click/touch targets over the existing Canvas action-bar art. */
export function createActionControls(canvas, script, onAbility) {
  if (!onAbility || !canvas.ownerDocument) return null;
  const doc=canvas.ownerDocument, root=doc.createElement('div');
  root.className='action-controls'; root.setAttribute('role','group'); root.setAttribute('aria-label','Combat abilities');
  root.hidden=true; canvas.after(root);
  const buttons=new Map();
  return {
    update(view,w,h,keys,overlay) {
      root.hidden=!!(overlay.idle || overlay.replay || overlay.paused || overlay.dim || view.ended);
      if (root.hidden) return;
      const slots=abilityButtons(view,script,w,h,keys), ids=new Set(slots.map(s=>s.id));
      for (const [id,button] of buttons) if (!ids.has(id)) { button.remove(); buttons.delete(id); }
      for (const slot of slots) {
        let button=buttons.get(slot.id);
        if (!button) {
          button=doc.createElement('button'); button.type='button'; button.className='action-button';
          button.addEventListener('click',()=>onAbility(slot.id));
          // Space/Enter activate the focused ability without also jumping.
          button.addEventListener('keydown',e=>{ if (e.code==='Space' || e.code==='Enter') e.stopPropagation(); });
          root.append(button); buttons.set(slot.id,button);
        }
        button.style.left=`${slot.x}px`; button.style.top=`${slot.y}px`;
        button.style.width=button.style.height=`${slot.size}px`;
        button.setAttribute('aria-label',slot.label);
        button.title=`${slot.label}${slot.tip ? ` — ${slot.tip}` : ''}`;
        button.disabled=slot.disabled;
      }
    },
    destroy() { root.remove(); },
  };
}
