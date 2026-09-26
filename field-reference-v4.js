(()=>{'use strict';
const API='pwa-field-reference-api',AUTH='slopro-auth-session-v1';
const labels={current_games:'現在G',cz_interval:'CZ間',at_interval:'AT間',bonus_interval:'BONUS間',bb_interval:'BB間',rb_interval:'RB間',st_interval:'ST間',loop_interval:'ループ間',through_count:'スルー',cycle:'周期',point:'pt',bonus_count:'BONUS回数',cz_count:'CZ回数',at_count:'AT回数',differential:'差枚',previous_payout:'前回獲得',previous_hit_games:'前回当選G',previous_at_count:'前回AT回数',previous_at_kind:'前回AT',previous_point:'前回pt',streak_count:'連荘',morning_state:'朝一',mode_state:'モード',hint_state:'示唆',special_state:'特殊状態',zone_state:'ゾーン'};
const ops={eq:'=',gte:'≥',gt:'>',lte:'≤',lt:'<',in:'∈',neq:'≠'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=v=>Array.isArray(v)?v.join('/'):String(v);
const pred=p=>(labels[p.field]??p.field)+(ops[p.op]??p.op)+val(p.value);
function token(){try{const x=JSON.parse(localStorage.getItem(AUTH)||'null');return x?.access_token||x?.currentSession?.access_token||null}catch{return null}}
async function load(){const t=token(),c=window.__SLOPRO_PUBLIC_CONFIG__;if(!t||!c?.supabaseUrl||!c?.publishableKey)throw Error('auth');const r=await fetch(c.supabaseUrl+'/functions/v1/'+API,{method:'POST',headers:{apikey:c.publishableKey,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error(String(r.status));const p=await r.json();if(p?.version!==2||p?.research_only!==true||!Array.isArray(p.machines)||p.machines.length!==34||p.machines.some(x=>x.go_ready!==false))throw Error('contract');const ms=p.machines;if(Array.isArray(p.legacy_rules?.['1'])){const g=ms.find(x=>x.machine_index===1);if(g)g.legacy_rules=p.legacy_rules['1']}return ms}
function shell(inner){document.querySelector('#app').innerHTML='<section class="shell field-overlay-shell field-focus-shell">'+inner+'</section>'}
function home(){location.reload()}
function index(ms){shell('<section class="field-index-screen"><div class="field-head"><button id="fr-home">← HOME</button><h2>現場調査 34機種</h2></div><div class="field-machine-grid">'+ms.map(m=>'<button class="field-machine-entry" data-fr="'+m.machine_index+'"><strong>'+esc(m.machine_name)+'</strong>'+(m.status==='LIVE_CHECK_REQUIRED'?'<span>LIVE</span>':'')+'</button>').join('')+'</div></section>');document.querySelector('#fr-home').onclick=home;document.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>machine(ms,Number(b.dataset.fr)))}
function shortLabel(s){return String(s||'条件').replace(/^Tokyo Ghoul morning CZ ceiling through0$/,'0スルー').replace(/^朝一/,'').trim()}
function compactPredicates(ps){const x=(ps||[]).filter(p=>p.field!=='morning_state');return x.map(p=>{const k=labels[p.field]??p.field,v=val(p.value);if(p.op==='eq')return k+' '+v;if(p.op==='gte')return k+' '+v+'～';if(p.op==='lte')return k+' ～'+v;return k+(ops[p.op]??p.op)+v}).join(' / ')}
function genericTable(rows){if(!rows.length)return'';const items=rows.map(r=>({label:shortLabel(r.label),text:compactPredicates(r.predicates)})),max=Math.max(...items.map(x=>(x.label+x.text).length)),cols=max<=34?3:max<=68?2:1;return '<div class="fr-auto-grid fr-cols-'+cols+'">'+items.map(x=>'<section class="fr-rule-card"><h4>'+esc(x.label)+'</h4><div>'+esc(x.text)+'</div></section>').join('')+'</div>'}
function ghoulTables(rows){
 const normal=rows.filter(r=>r.phase==='normal'), resetRows=rows.filter(r=>r.phase==='reset');
 const text=r=>String(r?.display_summary||'');
 const pick=(kind,match)=>normal.find(r=>r.strategy_type===kind&&match(text(r)));
 const lines=r=>text(r).split('\n').map(x=>x.trim()).filter(Boolean);
 const czBand=s=>String(s).replace(/\s+/g,' ').trim().replace(/^500～2200枚$/,'+500〜+2200').replace(/^-2000～500枚以下$/,'-2000〜+500').replace(/^-2000枚以下$/,'≤ -2000');
 const czRows=r=>lines(r).filter(x=>/^0から差枚/.test(x)).map(x=>{const p=x.split('｜');return [czBand(p[0].replace(/^0から差枚\s*/,'')),p[1]||''];});
 const atRows=r=>{let s='';return lines(r).flatMap(x=>{if(/^\d+スルー/.test(x)){s=x.replace('以降','〜');return []}if(!x.startsWith('・'))return [];const m=x.match(/当該CZ間\s*([０0-9]+G)｜AT間(.+?)(?:（当該足さず）)?$/);return m?[[s,m[1].replace('０','0'),m[2].replace(/（当該足さず）/g,''),x.includes('当該足さず')]]:[]});};
 const table=(head,body,cls='')=>'<table class="ghoul-data '+cls+'"><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+body.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x===true?'※':x===false?'':x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const atGrouped=rows=>{const groups=[];for(const [through,cz,at,note] of rows){let g=groups.find(x=>x[0]===through);if(!g){g=[through,[]];groups.push(g)}g[1].push([cz,at,note])}return groups};
 const atCompact=rows=>'<table class="ghoul-data at-compact at-matrix"><thead><tr><th>スルー</th><th>現在CZ間</th><th>必要AT間</th></tr></thead><tbody>'+atGrouped(rows).map(([s,x])=>x.map(([cz,at,note],i)=>'<tr class="'+(i===0?'group-start':'group-cont')+'">'+(i===0?'<td rowspan="'+x.length+'">'+esc(s)+'</td>':'')+'<td>'+esc(cz)+'</td><td>'+esc(at)+(note?' <small>※</small>':'')+'</td></tr>').join('')).join('')+'</tbody></table>';
 const cases=[
  ['駆け抜け',s=>s.startsWith('駆け抜け後')],
  ['前回AT 200〜1000枚',s=>s.includes('前回AT枚数 200～1000枚')],
  ['前回AT 1000枚以上',s=>s.includes('前回AT枚数1000枚以上')]
 ];
 const normalHtml='<h3 class="fr-title">通常</h3><div class="ghoul-note">※ 当該CZ間をAT間に足さない　<span>← 横にスワイプ →</span></div><div class="ghoul-case-carousel">'+cases.map(([name,match])=>{const cz=pick('cz_interval',match),at=pick('at_interval',match),czd=czRows(cz),atd=atRows(at);if(!czd.length||!atd.length)return '<section class="ghoul-case ghoul-case-row fr-data-error"><h4>'+name+'</h4><p>データ読込異常</p></section>';return '<section class="ghoul-case ghoul-case-row"><h4>'+name+'</h4><div class="ghoul-cz-strip"><b class="cz-head">CZ間</b><table class="ghoul-data cz-matrix"><thead><tr><th>差枚</th><th>開始G</th></tr></thead><tbody>'+czd.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td></tr>').join('')+'</tbody></table></div><div class="ghoul-at-full"><b class="at-head">AT間</b>'+atCompact(atd)+'</div></section>'}).join('')+'</div>';
 const reset=kind=>text(resetRows.find(r=>r.strategy_type===kind)).replace(/^朝一(?:ゾーン：|AT：|\s*)/,'');
 const morning='<h3 class="fr-title">朝一</h3><div class="morning-tables">'
  +'<section class="morning-block morning-cz"><b>CZ間</b><table><thead><tr><th>スルー</th><th>開始G</th></tr></thead><tbody><tr><td>0スルー</td><td>20G〜</td></tr></tbody></table></section>'
  +'<section class="morning-block morning-zone"><b>ゾーン</b><table><thead><tr><th>スルー</th><th>前回G</th><th>狙いG</th></tr></thead><tbody>'
   +'<tr><td rowspan="2">1スルー</td><td>0〜50 / 150〜200</td><td>20〜100G</td></tr>'
   +'<tr><td>それ以外</td><td>0〜100G</td></tr>'
   +'<tr><td rowspan="2">2スルー</td><td>250以内</td><td>30〜100G</td></tr>'
   +'<tr><td>250以上</td><td>60〜100G</td></tr>'
  +'</tbody></table><small class="morning-warning">※ 250は原文が「以内／以上」で重複。未解決のまま表示。</small></section>'
  +'<section class="morning-block morning-at"><b>AT間</b><table><thead><tr><th>スルー</th><th>現在CZ間</th><th>必要AT間</th></tr></thead><tbody>'
   +'<tr><td rowspan="2">1スルー</td><td>150G</td><td>350G〜</td></tr><tr><td>200G</td><td>0G〜</td></tr>'
   +'<tr><td rowspan="4">2スルー</td><td>0G</td><td>480G〜</td></tr><tr><td>50G</td><td>450G〜</td></tr><tr><td>100G</td><td>350G〜</td></tr><tr><td>150G</td><td>0G〜</td></tr>'
   +'<tr><td>3スルー〜</td><td>0G</td><td>0G〜</td></tr>'
  +'</tbody></table></section>'
  +'</div>';
 return normalHtml+morning;
}
function drawer(ms,current){return '<aside id="fr-rail" class="fr-rail"><div class="fr-rail-list">'+ms.map(m=>'<button class="fr-rail-machine'+(m.machine_index===current?' active':'')+'" data-mi="'+m.machine_index+'" title="'+esc(m.machine_name)+'"><span>'+esc(m.machine_name)+'</span>'+(m.status==='LIVE_CHECK_REQUIRED'?'<i>•</i>':'')+'</button>').join('')+'</div></aside>'}
function bindDrawer(ms,current){const rail=document.querySelector('#fr-rail');rail.querySelectorAll('.fr-rail-machine').forEach(b=>b.onclick=()=>machine(ms,Number(b.dataset.mi)));const active=rail.querySelector('.active');if(active)active.scrollIntoView({block:'nearest'})}
function machine(ms,i){const m=ms.find(x=>x.machine_index===i);if(!m)return index(ms);let body;if(m.status==='LIVE_CHECK_REQUIRED')body='<div class="field-badge wait">LIVE確認待ち</div><p class="field-wait">最新Live確認前のため条件を推測表示しません。</p>';else if(m.status!=='SOURCE_FIXED_SUBSET')body='<div class="field-badge wait">SOURCE確認待ち</div><p class="field-wait">条件を推測表示しません。</p>';else{const rows=(m.profiles?.eq??[]),morning=rows.filter(x=>(x.predicates??[]).some(p=>p.field==='morning_state'&&p.value==='first')),normal=rows.filter(x=>!morning.includes(x));body='<div class="field-badge">等価・調査用</div>'+(m.legacy_rules?.length?ghoulTables(m.legacy_rules):(normal.length?'<h3 class="fr-title">通常</h3>'+genericTable(normal):'')+(morning.length?'<h3 class="fr-title">朝一</h3>'+genericTable(morning):''))}shell('<section class="field-machine-screen">'+drawer(ms,i)+'<div class="field-head"><button id="fr-back" aria-label="一覧">‹</button><h2>'+esc(m.machine_name)+'</h2></div><div class="field-card">'+body+'</div></section>');document.querySelector('#fr-back').onclick=()=>index(ms);bindDrawer(ms,i)}
async function open(){shell('<section class="panel"><p class="status">現場調査データを読み込み中…</p></section>');try{index(await load())}catch{shell('<section class="panel"><p class="error">現場調査データを安全に取得できません。条件は表示しません。</p><button id="fr-home">戻る</button></section>');document.querySelector('#fr-home').onclick=home}}
function inject(){const p=document.querySelector('.home-panel');if(!p||document.querySelector('#open-field-reference-overlay'))return;const b=document.createElement('button');b.id='open-field-reference-overlay';b.className='store-entry field-reference-entry';b.innerHTML='<strong>現場調査</strong><span>34機種・高速確認</span>';b.onclick=open;p.appendChild(b)}
new MutationObserver(inject).observe(document.querySelector('#app'),{childList:true,subtree:true});inject();
})();

/* Gesture v18: native iOS scrolling only. No synthetic touchend movement. */
