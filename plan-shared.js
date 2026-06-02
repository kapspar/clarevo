/* Clarevo shared LIST-MANAGER for repeatable entry cards */
const SUPABASE_URL = 'https://ulabvzjtullhsshtstnt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsYWJ2emp0dWxsaHNzaHRzdG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDU4MDIsImV4cCI6MjA5NTQ4MTgwMn0.e2CZe4Vo4Hc7t1grFJdzIg7BlFvSsfi3dbgjKFAte1w';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BUCKET = 'documents';

let currentUser = null;
function $(id){ return document.getElementById(id); }

function requireAuth(onReady){
  db.auth.getSession().then(({ data:{ session } }) => {
    if(!session){ window.location.href = 'login.html'; return; }
    currentUser = session.user;
    onReady();
  });
}
async function signOut(){ await db.auth.signOut(); window.location.href = 'login.html'; }

class ListManager {
  constructor(config){
    this.cfg = Object.assign({ uploadLabel:'Relevant documents', hasUpload:true }, config);
    this.rows = [];
    this.container = $(this.cfg.container);
  }

  async load(){
    const { data, error } = await db.from(this.cfg.table)
      .select('*').eq('user_id', currentUser.id).order('created_at', { ascending:true });
    if(error){ console.error('Load error', this.cfg.table, error); }
    this.rows = (data && data.length) ? data : [];
    this.render();
  }

  addBlank(){
    const blank = { _new:true, _localId:'tmp-'+Date.now()+Math.random().toString(36).slice(2) };
    this.cfg.fields.forEach(f => blank[f.key] = '');
    blank.file_path = null;
    this.rows.push(blank);
    this.render();
    const card = this.container.lastElementChild;
    if(card){ const inp = card.querySelector('input,select,textarea'); if(inp) inp.focus(); }
  }

  rowKey(r){ return r.id || r._localId; }

  render(){
    const c = this.container;
    c.innerHTML = '';
    if(this.rows.length === 0){
      const empty = document.createElement('div');
      empty.className = 'list-empty';
      empty.textContent = this.cfg.emptyText || 'Nothing added yet.';
      c.appendChild(empty);
    }
    this.rows.forEach((r) => c.appendChild(this.cardEl(r)));
    if(this.cfg.onChange) this.cfg.onChange();
  }

  cardEl(r){
    const key = this.rowKey(r);
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.dataset.key = key;

    const head = document.createElement('div');
    head.className = 'entry-head';
    const title = document.createElement('div');
    title.className = 'entry-title';
    title.textContent = this.entryTitle(r);
    const del = document.createElement('button');
    del.className = 'entry-del'; del.type='button'; del.textContent='Remove';
    del.onclick = () => this.remove(key);
    head.appendChild(title); head.appendChild(del);
    card.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'entry-grid';
    this.cfg.fields.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'field' + (f.full ? ' full' : '');
      const lab = document.createElement('label');
      lab.innerHTML = f.label + (f.hint ? ' <span class="hint">'+f.hint+'</span>' : '');
      wrap.appendChild(lab);
      let input;
      if(f.type === 'select'){
        input = document.createElement('select');
        const o0=document.createElement('option'); o0.value=''; o0.textContent='Select…'; input.appendChild(o0);
        (f.options||[]).forEach(opt=>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; input.appendChild(o); });
      } else if(f.type === 'textarea'){
        input = document.createElement('textarea');
        if(f.placeholder) input.placeholder = f.placeholder;
      } else {
        input = document.createElement('input');
        if(f.placeholder) input.placeholder = f.placeholder;
      }
      input.value = r[f.key] || '';
      input.oninput = input.onchange = (e) => {
        r[f.key] = e.target.value;
        if(f.key === this.cfg.fields[0].key) title.textContent = this.entryTitle(r);
        if(this.cfg.onChange) this.cfg.onChange();
      };
      wrap.appendChild(input);
      grid.appendChild(wrap);
    });
    card.appendChild(grid);

    if(this.cfg.hasUpload) card.appendChild(this.uploadEl(r, key));
    return card;
  }

  entryTitle(r){
    const first = r[this.cfg.fields[0].key];
    return first && (''+first).trim() ? first : 'New entry';
  }

  uploadEl(r, key){
    const wrap = document.createElement('div'); wrap.className='entry-upload';
    const label = document.createElement('div'); label.className='upload-label'; label.textContent=this.cfg.uploadLabel;
    wrap.appendChild(label);
    const desc = document.createElement('div'); desc.className='upload-desc';
    desc.textContent='PDF, JPG, or PNG. Stored privately — only you and people you share access with can view it.';
    wrap.appendChild(desc);

    const uploaded = document.createElement('div');
    uploaded.className='uploaded-section'+(r.file_path?'':' hidden');
    const ut=document.createElement('div'); ut.className='us-title'; ut.textContent='Uploaded documents';
    const ulist=document.createElement('div');
    uploaded.appendChild(ut); uploaded.appendChild(ulist);
    wrap.appendChild(uploaded);

    const dz=document.createElement('div'); dz.className='dropzone';
    dz.innerHTML='<div class="dz-icon">📎</div><div class="dz-main">'+
      (r.file_path?'Click to upload another':'Click to upload or drag and drop')+
      '</div><div class="dz-sub">PDF, JPG, PNG up to 10MB</div>';
    wrap.appendChild(dz);

    const input=document.createElement('input'); input.type='file'; input.accept='.pdf,.jpg,.jpeg,.png'; input.className='hidden';
    wrap.appendChild(input);

    const renderPill=(name)=>{
      ulist.innerHTML='';
      const pill=document.createElement('div'); pill.className='file-pill';
      pill.innerHTML='<span class="fp-icon">📄</span><span class="fp-name"></span>';
      pill.querySelector('.fp-name').textContent=name;
      const view=document.createElement('a'); view.className='fp-view'; view.href='#'; view.textContent='View';
      view.onclick=async(e)=>{ e.preventDefault();
        const {data}=await db.storage.from(BUCKET).createSignedUrl(r.file_path,60);
        if(data) window.open(data.signedUrl,'_blank'); };
      const rem=document.createElement('button'); rem.className='fp-remove'; rem.type='button'; rem.textContent='Remove';
      rem.onclick=async()=>{ if(r.file_path) await db.storage.from(BUCKET).remove([r.file_path]);
        r.file_path=null; ulist.innerHTML=''; uploaded.classList.add('hidden');
        dz.querySelector('.dz-main').textContent='Click to upload or drag and drop';
        if(this.cfg.onChange) this.cfg.onChange(); };
      pill.appendChild(view); pill.appendChild(rem);
      ulist.appendChild(pill); uploaded.classList.remove('hidden');
      dz.querySelector('.dz-main').textContent='Click to upload another';
    };
    if(r.file_path) renderPill(r.file_path.split('/').pop());

    const handle=async(file)=>{
      const ok=['application/pdf','image/jpeg','image/png'];
      if(!ok.includes(file.type)){ alert('Please upload a PDF, JPG, or PNG.'); return; }
      if(file.size>10*1024*1024){ alert('File must be under 10MB.'); return; }
      dz.querySelector('.dz-main').textContent='Uploading…';
      const ext=file.name.split('.').pop();
      const path=currentUser.id+'/'+this.cfg.table+'-'+Date.now()+'.'+ext;
      const {error}=await db.storage.from(BUCKET).upload(path,file,{upsert:true});
      if(error){ console.error('Upload error',error); alert('Upload failed.'); dz.querySelector('.dz-main').textContent='Click to upload or drag and drop'; return; }
      r.file_path=path; renderPill(file.name);
      if(this.cfg.onChange) this.cfg.onChange();
    };
    dz.onclick=()=>input.click();
    dz.ondragover=e=>{ e.preventDefault(); dz.classList.add('drag'); };
    dz.ondragleave=()=>dz.classList.remove('drag');
    dz.ondrop=e=>{ e.preventDefault(); dz.classList.remove('drag'); if(e.dataTransfer.files.length) handle(e.dataTransfer.files[0]); };
    input.onchange=()=>{ if(input.files.length) handle(input.files[0]); };
    return wrap;
  }

  async remove(key){
    const idx=this.rows.findIndex(r=>this.rowKey(r)===key);
    if(idx<0) return;
    const r=this.rows[idx];
    if(!confirm('Remove this entry?')) return;
    if(r.file_path){ try{ await db.storage.from(BUCKET).remove([r.file_path]); }catch(e){} }
    if(r.id){ await db.from(this.cfg.table).delete().eq('id', r.id); }
    this.rows.splice(idx,1);
    this.render();
  }

  entryCompleteness(r){
    let got=0,max=0;
    this.cfg.fields.forEach(f=>{
      const w = (f.weight === undefined ? 1 : f.weight);
      if (w === 0) return; // skip zero-weight fields
      max+=w;
      if(r[f.key] && (''+r[f.key]).trim()) got+=w;
    });
    // Only count file_path toward score if uploadCounts is explicitly true
    if(this.cfg.hasUpload && this.cfg.uploadCounts === true){
      max+=1;
      if(r.file_path) got+=1;
    }
    return max?got/max:0;
  }
  score(){
    if(this.rows.length===0) return 0;
    const sum=this.rows.reduce((a,r)=>a+this.entryCompleteness(r),0);
    return Math.round((sum/this.rows.length)*100);
  }
  count(){ return this.rows.length; }

  async saveAll(){
    for(const r of this.rows){
      const rec={ user_id:currentUser.id, updated_at:new Date().toISOString() };
      if(this.cfg.hasUpload !== false) rec.file_path = r.file_path||null;
      this.cfg.fields.forEach(f=>rec[f.key]=r[f.key]?r[f.key]:null);
      if(r.id){
        const {error}=await db.from(this.cfg.table).update(rec).eq('id',r.id);
        if(error) throw error;
      } else {
        const {data,error}=await db.from(this.cfg.table).insert([rec]).select();
        if(error) throw error;
        if(data && data[0]){ r.id=data[0].id; delete r._new; }
      }
    }
  }
}

function saving(btnId, statusId, label){
  const btn=$(btnId), status=$(statusId);
  btn.disabled=true; btn.textContent='Saving…';
  return {
    done(){ btn.disabled=false; btn.textContent=label;
      status.textContent='✅ Saved — '+new Date().toLocaleTimeString(); status.className='save-status saved'; },
    fail(err){ console.error('Save error',err); btn.disabled=false; btn.textContent=label;
      status.textContent='❌ Error saving. Please try again.'; status.className='save-status error'; }
  };
}

/* ── single-row helpers (used by plan-legal.html) ── */
function setVal(id, v){ const el=$(id); if(el && v!=null) el.value=v; }
function getVal(id){ const el=$(id); return el ? (el.value||null) : null; }
function toggleVal(id){ const el=$(id); return el ? el.dataset.on==='true' : false; }
function setToggle(id, on){
  const el=$(id); if(!el) return;
  el.classList.toggle('on', !!on); el.dataset.on = on ? 'true' : 'false';
}
function bindToggle(id){
  const el=$(id); if(!el) return;
  el.addEventListener('click', ()=>{
    const on = el.dataset.on !== 'true';
    el.dataset.on = on ? 'true' : 'false';
    el.classList.toggle('on', on);
    const evt = el.getAttribute('data-onchange');
    if(evt && window[evt]) window[evt]();
  });
}
const uploadedFiles = {};
function initUploadSlot(slot, bucket, labelText){
  uploadedFiles[slot] = uploadedFiles[slot] || null;
  const input=$('file-'+slot), zone=$('dz-'+slot);
  if(!input || !zone) return;
  zone.addEventListener('click', ()=>input.click());
  zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', ()=>zone.classList.remove('drag'));
  zone.addEventListener('drop', e=>{ e.preventDefault(); zone.classList.remove('drag'); if(e.dataTransfer.files.length) _slotFile(slot,bucket,labelText,e.dataTransfer.files[0]); });
  input.addEventListener('change', ()=>{ if(input.files.length) _slotFile(slot,bucket,labelText,input.files[0]); });
}
async function _slotFile(slot,bucket,labelText,file){
  const ok=['application/pdf','image/jpeg','image/png'];
  if(!ok.includes(file.type)){ alert('Please upload a PDF, JPG, or PNG.'); return; }
  if(file.size>10*1024*1024){ alert('File must be under 10MB.'); return; }
  const zone=$('dz-'+slot), orig=zone.querySelector('.dz-main').textContent;
  zone.querySelector('.dz-main').textContent='Uploading…';
  const ext=file.name.split('.').pop();
  const path=currentUser.id+'/'+slot+'-'+Date.now()+'.'+ext;
  const {error}=await db.storage.from(bucket).upload(path,file,{upsert:true});
  zone.querySelector('.dz-main').textContent=orig;
  if(error){ console.error('Upload error',error); alert('Upload failed.'); return; }
  uploadedFiles[slot]=path; _slotRender(slot,bucket,labelText,file.name);
}
function _slotRender(slot,bucket,labelText,fileName){
  const section=$('uploaded-'+slot), list=$('uploaded-list-'+slot), zone=$('dz-'+slot);
  if(!section||!list) return;
  const display=fileName||(uploadedFiles[slot]?uploadedFiles[slot].split('/').pop():'document');
  list.innerHTML='<div class="file-pill"><span class="fp-icon">📄</span><span class="fp-name">'+display+'</span>'+
    '<a class="fp-view" href="#" onclick="viewSlotFile(\''+bucket+'\',\''+slot+'\');return false;">View</a>'+
    '<button class="fp-remove" onclick="removeSlotFile(\''+bucket+'\',\''+slot+'\')">Remove</button></div>';
  section.classList.remove('hidden');
  if(zone) zone.querySelector('.dz-main').textContent='Click to upload another';
}
async function viewSlotFile(bucket,slot){
  const path=uploadedFiles[slot]; if(!path) return;
  const {data}=await db.storage.from(bucket).createSignedUrl(path,60);
  if(data) window.open(data.signedUrl,'_blank');
}
async function removeSlotFile(bucket,slot){
  const path=uploadedFiles[slot]; if(!path) return;
  await db.storage.from(bucket).remove([path]); uploadedFiles[slot]=null;
  const section=$('uploaded-'+slot), list=$('uploaded-list-'+slot), zone=$('dz-'+slot);
  if(list) list.innerHTML=''; if(section) section.classList.add('hidden');
  if(zone) zone.querySelector('.dz-main').textContent='Click to upload or drag and drop';
}
function restoreUploaded(slot,bucket,labelText,path){
  if(!path) return; uploadedFiles[slot]=path; _slotRender(slot,bucket,labelText,path.split('/').pop());
}
