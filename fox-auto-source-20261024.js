// Keep the existing Auth client, layout, offline cache and all unrelated APIs.
(()=>{
 const nativeFetch=window.fetch.bind(window);
 const original='https://tcrenqxqdjomlqrngvck.supabase.co/functions/v1/pwa-field-reference-api';
 const automatic='https://tcrenqxqdjomlqrngvck.supabase.co/functions/v1/pwa-fox-live-api';
 window.fetch=async(input,options)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(url!==original)return nativeFetch(input,options);
  let body;try{body=JSON.parse(options?.body??await input.clone().text());}catch{return nativeFetch(input,options);}
  if(body.catalog_version!==5)return nativeFetch(input,options);
  try{
   const target=input instanceof Request?new Request(automatic,input):automatic;
   const response=await nativeFetch(target,options);
   if(response.ok||[401,403].includes(response.status))return response;
   await response.body?.cancel();
  }catch(error){if(options?.signal?.aborted||input instanceof Request&&input.signal.aborted)throw error;}
  return nativeFetch(input,options);
 };
})();
