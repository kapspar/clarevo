const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const payload = `<img src=x onerror="alert(1)"> O'Neil`;
const invite = { id: "id'quote", owner_id: 'a', owner_name: payload, invitee_email: payload, relationship: payload, status: 'pending', access_legal: true };
class Element {
  constructor() { this.children = []; this.nodes = new Map(); this.style = {}; this.dataset = {}; this.classList = { add() {} }; }
  set innerHTML(value) { assert(!value.includes('<img') && !value.includes('onclick=')); this.children = []; }
  querySelector(selector) { if (!this.nodes.has(selector)) this.nodes.set(selector, new Element()); return this.nodes.get(selector); }
  appendChild(el) { this.children.push(el); }
  remove() { this.removed = true; }
}
const root = new Element(), actions = [];
const query = { select() { return this; }, eq() { return this; }, limit() { return { data: [] }; }, in() { return this; }, order() { return { data: [invite, { ...invite, status: 'active' }] }; } };
const env = {
  document: { getElementById: id => root.querySelector(id), createElement: () => new Element() },
  db: { from: () => query }, SECTIONS: ['legal'], SECTION_LABELS: { legal: 'Legal' },
  window: { location: {} }, sessionStorage: { setItem: (k,v) => actions.push([k,JSON.parse(v)]) },
  getSections: () => ['legal'], getOwnerName: (_, inv) => inv.owner_name,
  goToSharedView: (...args) => actions.push(args),
  resendInvite: (...args) => actions.push(args), editInvite: (...args) => actions.push(args), revokeAccess: (...args) => actions.push(args),
};
vm.createContext(env);
for (const [file, names] of [['dashboard.html', ['buildPlanSwitcher','loadSharedAccess']], ['shared-welcome.html', ['showWelcomeContent']]]) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  for (const name of names) {
    const start = html.indexOf('  async function ' + name + '(');
    vm.runInContext(html.slice(start, html.indexOf('\n  }', start) + 4), env);
  }
}
(async () => {
  await env.buildPlanSwitcher([invite]);
  const card = root.querySelector('sharedWithMeList').children[0];
  assert.equal(card.querySelector('.ic-name').textContent, payload + "'s Family Plan");
  card.querySelector('button').onclick();
  assert.deepEqual(actions.pop(), ['viewSharedPlan', { invite, ownerName: payload }]);
  assert.equal(env.window.location.href, 'shared-view.html');
  await env.loadSharedAccess({ id: 'a' });
  const [pending, active] = root.querySelector('sharedPeopleList').children;
  assert.equal(pending.querySelector('.ic-name').textContent, payload);
  assert.equal(pending.querySelector('.ic-meta').textContent, payload + ' · Legal');
  assert.equal(pending.querySelector('.ic-status').textContent, 'Invite sent');
  pending.querySelector('[data-action="resend"]').onclick();
  assert.deepEqual(actions.pop(), [invite.id, invite.invitee_email]);
  for (const action of ['edit', 'revoke']) {
    pending.querySelector('[data-action="' + action + '"]').onclick();
    assert.deepEqual(actions.pop(), [invite.id]);
  }
  assert.equal(active.querySelector('[data-action="resend"]').removed, true);
  await env.showWelcomeContent([invite, invite]);
  const button = root.querySelector('planBtns').children[0];
  assert.equal(button.querySelector('.pbt-name').textContent, payload + "'s Plan");
  button.onclick();
  assert.deepEqual(actions.pop(), [invite, payload]);
  console.log('PASS: invite HTML payload is rendered as text and sharing callbacks retain original values');
})().catch(error => { console.error(error); process.exitCode = 1; });
