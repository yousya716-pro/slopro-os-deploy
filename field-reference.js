(()=>{'use strict';
const API='pwa-field-reference-api',AUTH='slopro-auth-session-v1';
const labels={current_games:'現在G',cz_interval:'CZ間',at_interval:'AT間',bonus_interval:'BONUS間',bb_interval:'BB間',rb_interval:'RB間',st_interval:'ST間',loop_interval:'ループ間',through_count:'スルー',cycle:'周期',point:'pt',bonus_count:'BONUS回数',cz_count:'CZ回数',at_count:'AT回数',differential:'差枚',previous_payout:'前回獲得',previous_hit_games:'前回当選G',previous_at_count:'前回AT回数',previous_at_kind:'前回AT',previous_point:'前回pt',streak_count:'連荘',morning_state:'朝一',mode_state:'モード',hint_state:'示唆',special_state:'特殊状態',zone_state:'ゾーン'};
const ops={eq:'=',gte:'≥',gt:'>',lte:'≤',lt:'<',in:'∈',neq:'≠'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=v=>Array.isArray(v)?v.join('/'):String(v);
const pred=p=>(labels[p.field]??p.field)+(ops[p.op]??p.op)+val(p.value);
function token(){try{const x=JSON.parse(localStorage.getItem(AUTH)||'null');return x?.access_token||x?.currentSession?.access_token||null}catch{return null}}
async function load(){const t=token(),c=window.__SLOPRO_PUBLIC_CONFIG__;if(!t||!c?.supabaseUrl||!c?.publishableKey)throw Error('auth');const r=await fetch(c.supabaseUrl+'/functions/v1/'+API,{method:'POST',headers:{apikey:c.publishableKey,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error(String(r.status));const p=await r.json();if(p?.version!==2||p?.research_only!==true||!Array.isArray(p.machines)||p.machines.length!==34||p.machines.some(x=>x.go_ready!==false))throw Error('contract');const ms=p.machines;if(Array.isArray(p.legacy_rules?.['1'])){const g=ms.find(x=>x.machine_index===1);if(g)g.legacy_rules=p.legacy_rules['1']}return ms}
function shell(inner){document.querySelector('#app').innerHTML='<section class="shell field-overlay-shell"><div class="top"><h1>スロプロ復帰OS</h1></div>'+inner+'</section>'}
function home(){location.reload()}
function index(ms){shell('<section class="field-index-screen"><div class="field-head"><button id="fr-home">← HOME</button><h2>現場調査 34機種</h2></div><div class="field-machine-grid">'+ms.map(m=>'<button class="field-machine-entry" data-fr="'+m.machine_index+'"><strong>'+esc(m.machine_name)+'</strong>'+(m.status==='LIVE_CHECK_REQUIRED'?'<span>LIVE</span>':'')+'</button>').join('')+'</div></section>');document.querySelector('#fr-home').onclick=home;document.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>machine(ms,Number(b.dataset.fr)))}
function shortLabel(s){return String(s||'条件').replace(/^Tokyo Ghoul morning CZ ceiling through0$/,'0スルー').replace(/^朝一/,'').trim()}
function compactPredicates(ps){const x=(ps||[]).filter(p=>p.field!=='morning_state');return x.map(p=>{const k=labels[p.field]??p.field,v=val(p.value);if(p.op==='eq')return k+' '+v;if(p.op==='gte')return k+' '+v+'～';if(p.op==='lte')return k+' ～'+v;return k+(ops[p.op]??p.op)+v}).join(' / ')}
function genericTable(rows){if(!rows.length)return'';const items=rows.map(r=>({label:shortLabel(r.label),text:compactPredicates(r.predicates)})),max=Math.max(...items.map(x=>(x.label+x.text).length)),cols=max<=34?3:max<=68?2:1;return '<div class="fr-auto-grid fr-cols-'+cols+'">'+items.map(x=>'<section class="fr-rule-card"><h4>'+esc(x.label)+'</h4><div>'+esc(x.text)+'</div></section>').join('')+'</div>'}
function ghoulTables(rows){
 const get=(phase,type)=>rows.find(r=>r.phase===phase&&r.strategy_type===type)?.display_summary||'';
 const strip=s=>String(s||'').split('\n').filter(x=>x&&!/^(▼|50貸50交換|０?0?スルー$)/.test(x)&&!/^駆け抜け/.test(x)&&!/^朝一/.test(x)).join('\n');
 const normal=rows.filter(r=>r.phase==='normal'), reset=rows.filter(r=>r.phase==='reset');
 const rid=r=>Number(r?.rule_id);
 const groups=[
  ['駆け抜け',normal.find(r=>rid(r)===1),normal.find(r=>rid(r)===2)],
  ['前回AT 200–1000枚',normal.find(r=>rid(r)===5),normal.find(r=>rid(r)===6)],
  ['前回AT 1000枚以上',normal.find(r=>rid(r)===9),normal.find(r=>rid(r)===10)]
 ];
 const n='<h3 class="fr-title">通常</h3><div class="ghoul-case-grid">'+groups.map(g=>'<section class="ghoul-case"><h4>'+g[0]+'</h4><div class="ghoul-split"><div><b>CZ間</b><p>'+esc(strip(g[1]?.display_summary))+'</p></div><div><b>AT間</b><p>'+esc(strip(g[2]?.display_summary))+'</p></div></div></section>').join('')+'</div>';
 const cz=get('reset','cz_interval').replace(/^朝一\s*/,'');
 const zone=get('reset','zone').replace(/^朝一ゾーン：?/,'');
 const at=get('reset','at_interval').replace(/^朝一AT：?/,'');
 const a='<h3 class="fr-title">朝一</h3><div class="ghoul-morning-grid"><section><b>CZ</b><p>'+esc(cz)+'</p></section><section><b>ゾーン</b><p>'+esc(zone)+'</p></section><section><b>AT</b><p>'+esc(at)+'</p></section></div>';
 return n+a;
}
function machine(ms,i){const m=ms.find(x=>x.machine_index===i);if(!m)return index(ms);let body;if(m.status==='LIVE_CHECK_REQUIRED')body='<div class="field-badge wait">LIVE確認待ち</div><p class="field-wait">最新Live確認前のため条件を推測表示しません。</p>';else if(m.status!=='SOURCE_FIXED_SUBSET')body='<div class="field-badge wait">SOURCE確認待ち</div><p class="field-wait">条件を推測表示しません。</p>';else{const rows=(m.profiles?.eq??[]),morning=rows.filter(x=>(x.predicates??[]).some(p=>p.field==='morning_state'&&p.value==='first')),normal=rows.filter(x=>!morning.includes(x));body='<div class="field-badge">等価・調査用</div>'+(m.legacy_rules?.length?ghoulTables(m.legacy_rules):(normal.length?'<h3 class="fr-title">通常</h3>'+genericTable(normal):'')+(morning.length?'<h3 class="fr-title">朝一</h3>'+genericTable(morning):''))}shell('<section class="field-machine-screen"><div class="field-head"><button id="fr-back">← 一覧</button><h2>'+esc(m.machine_name)+'</h2></div><div class="field-card">'+body+'</div></section>');document.querySelector('#fr-back').onclick=()=>index(ms)}
async function open(){shell('<section class="panel"><p class="status">現場調査データを読み込み中…</p></section>');try{index(await load())}catch{shell('<section class="panel"><p class="error">現場調査データを安全に取得できません。条件は表示しません。</p><button id="fr-home">戻る</button></section>');document.querySelector('#fr-home').onclick=home}}
function inject(){const p=document.querySelector('.home-panel');if(!p||document.querySelector('#open-field-reference-overlay'))return;const b=document.createElement('button');b.id='open-field-reference-overlay';b.className='store-entry field-reference-entry';b.innerHTML='<strong>現場調査</strong><span>34機種・高速確認</span>';b.onclick=open;p.appendChild(b)}
new MutationObserver(inject).observe(document.querySelector('#app'),{childList:true,subtree:true});inject();
})();