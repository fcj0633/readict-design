const dictCache=new Map<string,any>();
export async function dictionary(lemma:string,signal:AbortSignal){
  if(dictCache.has(lemma))return dictCache.get(lemma);
  const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(lemma),{signal:AbortSignal.any([signal,AbortSignal.timeout(12000)])});
  if(!r.ok)throw Error(r.status===404?'未找到词条':`词典 HTTP ${r.status}`);const data=await r.json();dictCache.set(lemma,data);return data;
}
export async function translate(sentence:string,signal:AbortSignal){
  if(new TextEncoder().encode(sentence).length>500)throw Error('此实验服务限制为 500 字节，长句尚未验证');
  const key='translation:v1:en:zh-CN:'+sentence;const cached=localStorage.getItem(key);if(cached)return cached;
  const r=await fetch('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:sentence,langpair:'en|zh-CN'}),{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});
  if(!r.ok)throw Error(`翻译 HTTP ${r.status}`);const data=await r.json();if(Number(data.responseStatus)!==200||!data.responseData?.translatedText)throw Error(data.responseDetails||'翻译失败');
  const result=data.responseData.translatedText;localStorage.setItem(key,result);return result;
}
