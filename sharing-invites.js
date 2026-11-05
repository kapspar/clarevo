// Only expose shares confirmed by the database for this signed-in recipient.
async function loadRecipientShares(db, user) {
  const { data, error } = await db.from('shared_access')
    .select('*')
    .eq('invitee_email', user.email)
    .in('status', ['pending', 'registered', 'active']);

  const shares = [];
  let failed = Boolean(error);
  for (const invite of data || []) {
    if (invite.invitee_id === user.id && invite.status !== 'pending') {
      shares.push(invite);
      continue;
    }
    if (invite.invitee_id && invite.invitee_id !== user.id) continue;

    const status = invite.status === 'pending' ? 'registered' : invite.status;
    const { data: saved, error: updateError } = await db.from('shared_access')
      .update({ invitee_id: user.id, status })
      .eq('id', invite.id)
      .eq('status', invite.status)
      .select('*')
      .maybeSingle();
    if (updateError || !saved || saved.invitee_id !== user.id || saved.status !== status) {
      failed = true;
      continue;
    }
    shares.push(saved);
  }
  return { shares, failed };
}
