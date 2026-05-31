/* Clarevo shared plan-page JS helpers */
const SUPABASE_URL = 'https://ulabvzjtullhsshtstnt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsYWJ2emp0dWxsaHNzaHRzdG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDU4MDIsImV4cCI6MjA5NTQ4MTgwMn0.e2CZe4Vo4Hc7t1grFJdzIg7BlFvSsfi3dbgjKFAte1w';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let existingRecordId = null;

/* uploadedFiles maps a slot key -> stored storage path (or null) */
const uploadedFiles = {};

/* ── small helpers ── */
function $(id) { return document.getElementById(id); }
function setVal(id, v) { const el = $(id); if (el && v != null) el.value = v; }
function getVal(id) { const el = $(id); return el ? (el.value || null) : null; }
function setToggle(id, on) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('on', !!on);
  el.dataset.on = on ? 'true' : 'false';
  const evt = el.getAttribute('data-onchange');
  if (evt) window[evt] && window[evt]();
}
function toggleVal(id) { const el = $(id); return el ? el.dataset.on === 'true' : false; }
function bindToggle(id) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('click', () => {
    const on = el.dataset.on !== 'true';
    el.dataset.on = on ? 'true' : 'false';
    el.classList.toggle('on', on);
    const evt = el.getAttribute('data-onchange');
    if (evt && window[evt]) window[evt]();
  });
}

/* ── auth ── */
function requireAuth(onReady) {
  db.auth.getSession().then(({ data: { session } }) => {
    if (!session) { window.location.href = 'login.html'; return; }
    currentUser = session.user;
    onReady();
  });
}
async function signOut() {
  await db.auth.signOut();
  window.location.href = 'login.html';
}

/* ── file upload ──
   slot: unique key (e.g. 'will')
   bucket: storage bucket name (use 'documents')
   labelText: human label shown in the uploaded section ("Will", "Policy", etc.)
*/
function initUploadSlot(slot, bucket, labelText) {
  uploadedFiles[slot] = uploadedFiles[slot] || null;
  const input = $('file-' + slot);
  const zone = $('dz-' + slot);
  if (!input || !zone) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('drag');
    if (e.dataTransfer.files.length) handleFile(slot, bucket, labelText, e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => {
    if (input.files.length) handleFile(slot, bucket, labelText, input.files[0]);
  });
}

async function handleFile(slot, bucket, labelText, file) {
  const okTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!okTypes.includes(file.type)) { alert('Please upload a PDF, JPG, or PNG.'); return; }
  if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB.'); return; }

  const zone = $('dz-' + slot);
  const origMain = zone.querySelector('.dz-main').textContent;
  zone.querySelector('.dz-main').textContent = 'Uploading…';

  const ext = file.name.split('.').pop();
  const path = `${currentUser.id}/${slot}-${Date.now()}.${ext}`;

  const { error } = await db.storage.from(bucket).upload(path, file, { upsert: true });
  zone.querySelector('.dz-main').textContent = origMain;

  if (error) { console.error('Upload error:', error); alert('Upload failed. Please try again.'); return; }

  uploadedFiles[slot] = path;
  renderUploaded(slot, bucket, labelText, file.name);
}

function renderUploaded(slot, bucket, labelText, fileName) {
  const section = $('uploaded-' + slot);
  const list = $('uploaded-list-' + slot);
  const zone = $('dz-' + slot);
  if (!section || !list) return;

  // derive display name from stored path if no friendly name passed
  const display = fileName || (uploadedFiles[slot] ? uploadedFiles[slot].split('/').pop() : 'document');

  list.innerHTML = `
    <div class="file-pill">
      <span class="fp-icon">📄</span>
      <span class="fp-name">${display}</span>
      <a class="fp-view" href="#" onclick="viewFile('${bucket}','${slot}');return false;">View</a>
      <button class="fp-remove" onclick="removeFile('${bucket}','${slot}','${labelText}')">Remove</button>
    </div>`;
  section.classList.remove('hidden');
  if (zone) {
    zone.querySelector('.dz-main').textContent = 'Click to upload another';
  }
}

async function viewFile(bucket, slot) {
  const path = uploadedFiles[slot];
  if (!path) return;
  const { data, error } = await db.storage.from(bucket).createSignedUrl(path, 60);
  if (error || !data) { alert('Could not open file.'); return; }
  window.open(data.signedUrl, '_blank');
}

async function removeFile(bucket, slot, labelText) {
  const path = uploadedFiles[slot];
  if (!path) return;
  await db.storage.from(bucket).remove([path]);
  uploadedFiles[slot] = null;
  const section = $('uploaded-' + slot);
  const list = $('uploaded-list-' + slot);
  const zone = $('dz-' + slot);
  if (list) list.innerHTML = '';
  if (section) section.classList.add('hidden');
  if (zone) zone.querySelector('.dz-main').textContent = 'Click to upload or drag and drop';
}

/* called on load to restore an already-saved file path */
function restoreUploaded(slot, bucket, labelText, path) {
  if (!path) return;
  uploadedFiles[slot] = path;
  renderUploaded(slot, bucket, labelText, path.split('/').pop());
}

/* ── save status helper ── */
function saving(btnId, statusId, label) {
  const btn = $(btnId), status = $(statusId);
  btn.disabled = true; btn.textContent = 'Saving…';
  return {
    done() {
      btn.disabled = false; btn.textContent = label;
      status.textContent = '✅ Saved — ' + new Date().toLocaleTimeString();
      status.className = 'save-status saved';
    },
    fail(err) {
      console.error('Save error:', err);
      btn.disabled = false; btn.textContent = label;
      status.textContent = '❌ Error saving. Please try again.';
      status.className = 'save-status error';
    }
  };
}
