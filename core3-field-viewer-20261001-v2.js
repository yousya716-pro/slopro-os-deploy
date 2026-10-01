// Local file rendering only. No network, credentials, storage or remote Source access.
const AUDIT_SHA256='596b8da84b435df6a4224708c1c450f9ec610c21c0118a81b53a7133488fc626';
const FIELD_SHA256='d5e75d33a2e32650309da3e65cb674e45b8d6506c1679509d4981c411a36b62f';
const FIELD_V2_SHA256='fe8b941b9922e1db3f411ea8f50ac953eeaf2cd4037cd113c8196eb1062c4976';
const MAX_BYTES=2*1024*1024;
const input=document.querySelector('#report-file'),frame=document.querySelector('#report-frame'),status=document.querySelector('#viewer-status'),clear=document.querySelector('#clear-report');
let generation=0;
function reset(message){frame.hidden=true;frame.removeAttribute('srcdoc');clear.hidden=true;document.body.classList.remove('loaded');status.textContent=message;}
clear.addEventListener('click',()=>{generation++;input.value='';reset('資料を閉じました。ファイルは送信・保存していません。');});
input.addEventListener('change',async()=>{
 const ticket=++generation,file=input.files?.[0];reset('ファイルを確認しています。');
 if(!file){reset('「ダークカード画面.html」「カード画面.html」または「検証画面.html」を選んでください。');return;}
 if(file.size>MAX_BYTES){reset('指定の検証ファイルを選んでください。');return;}
 try{
  const bytes=await file.arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(ticket!==generation)return;
  if(hash!==AUDIT_SHA256&&hash!==FIELD_SHA256&&hash!==FIELD_V2_SHA256){reset('指定の「ダークカード画面.html」「カード画面.html」または「検証画面.html」と一致しません。説明書や別版のファイルは表示しません。');return;}
  const html=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  // The verified document has no scripts. Sandbox and CSP also block script/network/storage.
  const guard='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; connect-src \'none\'; img-src \'none\'; object-src \'none\'; form-action \'none\'"><base href="about:srcdoc">';
  frame.srcdoc=html.replace('<html lang="ja">','<html lang="ja">'+guard);
  frame.hidden=false;clear.hidden=false;document.body.classList.add('loaded');
  status.textContent='カード／資料を表示中。実戦開始の許可ではありません。';
 }catch{if(ticket===generation)reset('ファイルを読み取れませんでした。もう一度選んでください。');}
});
