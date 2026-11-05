const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync('sharing-invites.js', 'utf8'), context);
const user = { id: 'recipient', email: 'recipient@example.test' };
const rows = [
  { id: 'active', status: 'active', invitee_id: user.id },
  { id: 'pending', status: 'pending', invitee_id: null },
  { id: 'legacy', status: 'registered', invitee_id: null },
  { id: 'revoked', status: 'pending', invitee_id: null },
  { id: 'denied', status: 'pending', invitee_id: null },
  { id: 'foreign', status: 'active', invitee_id: 'other-user' },
];
const updates = [];
const db = {
  from(table) {
    assert.equal(table, 'shared_access');
    return {
      select() { return this; },
      eq(field, value) {
        if (field === 'id') this.id = value;
        if (field === 'status') this.status = value;
        if (field === 'invitee_email') assert.equal(value, user.email);
        return this;
      },
      in() { return { data: rows }; },
      update(values) { this.values = values; return this; },
      maybeSingle() {
        updates.push(this.id);
        assert.equal(this.status, rows.find(row => row.id === this.id).status);
        assert.equal(this.values.invitee_id, user.id);
        assert.equal(this.values.status, 'registered');
        if (this.id === 'revoked') return { data: null };
        if (this.id === 'denied') return { error: { code: '42501' } };
        return { data: { id: this.id, ...this.values, access_legal: false } };
      },
    };
  },
};

(async () => {
  const result = await context.loadRecipientShares(db, user);
  assert.deepEqual(Array.from(result.shares, share => share.id), ['active', 'pending', 'legacy']);
  assert.equal(result.shares[1].access_legal, false);
  assert.deepEqual(updates, ['pending', 'legacy', 'revoked', 'denied']);
  assert.equal(result.failed, true);
  const unavailable = { from: () => ({ select() { return this; }, eq() { return this; }, in() { return { error: {} }; } }) };
  const failure = await context.loadRecipientShares(unavailable, user);
  assert.equal(failure.shares.length, 0);
  assert.equal(failure.failed, true);
  console.log('PASS: only confirmed recipient shares are displayed');
})().catch(error => { console.error(error); process.exitCode = 1; });
