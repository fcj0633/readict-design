import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import ePub from 'epubjs';
import {computePosition,offset,flip,shift} from '@floating-ui/dom';
import {contextFromPoint,outerRect,type Context} from './core';
import {prepareBook} from './importBook';
import {dictionary,translate} from './services';
import './style.css';

const read=(k:string,f:any)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f;}catch{return f;}};
async function storeBook(value?:ArrayBuffer):Promise<ArrayBuffer|undefined>{return new Promise((resolve,reject)=>{const req=indexedDB.open('readict-spike',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('files',value?'readwrite':'readonly');const op=value?tx.objectStore('files').put(value,'last'):tx.objectStore('files').get('last');op.onsuccess=()=>resolve(value||op.result);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error);};});}
function App(){
  const host=useRef<HTMLDivElement>(null), card=useRef<HTMLDivElement>(null), engine=useRef<any>(null), session=useRef(0);
  const [status,setStatus]=useState('正在加载 EPUB…'),[title,setTitle]=useState('技术实验'),[toc,setToc]=useState<any[]>([]),[location,setLocation]=useState<any>(null);
  const [font,setFont]=useState<number>(read('font',18)),[ctx,setCtx]=useState<Context|null>(null),[entry,setEntry]=useState<any>(null),[dictError,setDictError]=useState(''),[translated,setTranslated]=useState(''),[transError,setTransError]=useState(''),[transLoading,setTransLoading]=useState(false),[transRequest,setTransRequest]=useState<{context:Context;id:number}|null>(null),[retry,setRetry]=useState(0),[saved,setSaved]=useState<any[]>(read('favorites',[]));
  const close=()=>setCtx(null);
  async function open(buffer:ArrayBuffer,persist=false){
    const id=++session.current;setStatus('导入与安全预处理…');close();
    try{
      const start=performance.now();const prepared=await prepareBook(buffer);if(id!==session.current)return;
      engine.current?.book.destroy();host.current!.replaceChildren();
      const book=ePub(prepared.buffer,{replacements:'blobUrl'});await book.ready;if(id!==session.current){book.destroy();return;}
      const rendition=book.renderTo('reader',{width:'100%',height:'100%',flow:'paginated',spread:'none',manager:'default',allowScriptedContent:false});
      engine.current={book,rendition,hash:prepared.hash};
      rendition.themes.default({'body':{'font-family':'Georgia, serif !important','line-height':'1.65 !important'},'img':{'max-width':'100%','max-height':'80vh'}});rendition.themes.fontSize(font+'px');
      rendition.hooks.content.register((contents:any)=>{
        const doc=contents.document as Document;
        doc.addEventListener('click',(event:MouseEvent)=>{if((event.target as Element).closest('a')){close();return;}const start=performance.now();const hit=contextFromPoint(doc,event.clientX,event.clientY,contents,prepared.hash);if(hit){hit.href=book.spine.get(contents.sectionIndex)?.href||'';setCtx(hit);(window as any).__spike.clickMs=performance.now()-start;}else close();});
        doc.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Escape')close();if(e.key==='ArrowRight'){close();void rendition.next();}if(e.key==='ArrowLeft'){close();void rendition.prev();}});
      });
      rendition.on('relocated',(loc:any)=>{setLocation(loc);localStorage.setItem('progress:'+prepared.hash,JSON.stringify({cfi:loc.start.cfi,href:loc.start.href,at:Date.now(),pipeline:'sanitize-v1'}));});
      rendition.on('resized',()=>close());
      const nav=await book.loaded.navigation;setToc(nav.toc);setTitle(book.packaging.metadata.title);
      const progress=read('progress:'+prepared.hash,null);await rendition.display(progress?.cfi);setStatus('已加载 · 单页分页');
      (window as any).__spike={...((window as any).__spike||{}),book,rendition,hash:prepared.hash,importMs:performance.now()-start,context:()=>null};
      if(persist){await storeBook(buffer);localStorage.setItem('bookSource','upload');}
    }catch(e){if(id===session.current)setStatus('导入失败：'+String(e));}
  }
  useEffect(()=>{let live=true;(async()=>{try{const uploaded=localStorage.getItem('bookSource')==='upload'?await storeBook():undefined;const buffer=uploaded||await (await fetch('/books/fixture.epub')).arrayBuffer();if(live)await open(buffer);}catch(e){setStatus(String(e));}})();return()=>{live=false;session.current++;engine.current?.book.destroy();};},[]);
  useEffect(()=>{if((window as any).__spike)(window as any).__spike.context=()=>ctx;},[ctx]);
  useEffect(()=>{const handle=(e:KeyboardEvent)=>{if(e.key==='Escape')close();if(e.key==='ArrowRight'){close();void engine.current?.rendition.next();}if(e.key==='ArrowLeft'){close();void engine.current?.rendition.prev();}};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[]);
  useEffect(()=>{if(!ctx)return;const controller=new AbortController();setEntry(null);setDictError('');setTranslated('');setTransError('');setTransLoading(false);
    dictionary(ctx.lemma,controller.signal).then(data=>{if(!controller.signal.aborted)setEntry(data);}).catch(e=>{if(!controller.signal.aborted)setDictError(String(e));});
    return()=>controller.abort();
  },[ctx,retry]);
  useEffect(()=>{if(!ctx||transRequest?.context!==ctx)return;const controller=new AbortController();setTransLoading(true);setTransError('');translate(ctx.sentence,controller.signal).then(t=>{if(!controller.signal.aborted)setTranslated(t);}).catch(e=>{if(!controller.signal.aborted)setTransError(String(e));}).finally(()=>{if(!controller.signal.aborted)setTransLoading(false);});return()=>controller.abort();},[transRequest,ctx]);
  useEffect(()=>{if(!ctx||!card.current)return;const el=card.current;let alive=true;
    const position=async()=>{if(!ctx.range.startContainer.isConnected){close();return;}const reference={getBoundingClientRect:()=>outerRect(ctx)};const result=await computePosition(reference,el,{strategy:'fixed',placement:'right',middleware:[offset(12),flip({fallbackPlacements:['left','bottom','top']}),shift({padding:8})]});if(!alive)return;el.style.left=result.x+'px';el.style.top=result.y+'px';el.dataset.placement=result.placement;const a=outerRect(ctx),b=el.getBoundingClientRect();if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top){el.style.maxHeight=Math.max(40,Math.max(a.top-16,innerHeight-a.bottom-16))+'px';el.style.top=(a.top>innerHeight-a.bottom?8:a.bottom+8)+'px';}
    };
    void position();const observer=new ResizeObserver(()=>void position());observer.observe(el);window.addEventListener('resize',position);
    // Selection highlights text without adding spans or changing the source DOM.
    const selection=ctx.range.startContainer.ownerDocument!.getSelection();selection?.removeAllRanges();selection?.addRange(ctx.range);
    return()=>{alive=false;observer.disconnect();window.removeEventListener('resize',position);selection?.removeAllRanges();};
  },[ctx]);
  const changeFont=(n:number)=>{close();setFont(n);localStorage.setItem('font',JSON.stringify(n));engine.current?.rendition.themes.fontSize(n+'px');};
  const meanings=(entry||[]).flatMap((e:any)=>e.meanings||[]);const ordered=[...meanings].sort((a:any,b:any)=>Number(b.partOfSpeech===ctx?.pos)-Number(a.partOfSpeech===ctx?.pos));
  const phonetics=(entry||[]).flatMap((e:any)=>e.phonetics||[]);const audio=phonetics.find((p:any)=>p.audio)?.audio;
  const favorite=()=>{if(!ctx)return;const {range,iframe,...plain}=ctx;const key=ctx.bookHash+ctx.cfi;const next=[...saved];let item=next.find(i=>i.lemma===ctx.lemma);if(!item){item={lemma:ctx.lemma,entry,contexts:[]};next.push(item);}if(!item.contexts.some((c:any)=>c.key===key))item.contexts.push({...plain,key,title,translation:translated});localStorage.setItem('favorites',JSON.stringify(next));setSaved(next);};
  return <div onClick={()=>close()}><header><strong>READICT / 技术验证</strong><span>{title}</span><label className="import">导入 EPUB<input aria-label="导入 EPUB" type="file" accept=".epub" onChange={async e=>{const f=e.target.files?.[0];if(f)await open(await f.arrayBuffer(),true);}}/></label></header>
    <main><div className="meta"><span role="status">{status}</span><span data-testid="page">{location?.start?.displayed?.page||'—'} / {location?.start?.displayed?.total||'—'} · 章节页码，随版式变化</span></div><div id="reader" ref={host}/><footer><button onClick={()=>{close();void engine.current?.rendition.prev();}}>上一页</button><small data-testid="cfi">{location?.start?.cfi}</small><button onClick={()=>{close();void engine.current?.rendition.next();}}>下一页</button></footer></main>
    <aside onClick={e=>e.stopPropagation()}><label>章节<select aria-label="章节" onChange={e=>{close();void engine.current?.rendition.display(e.target.value);}} value=""><option value="" disabled>跳转目录</option>{toc.flatMap((t:any)=>[t,...(t.subitems||[])]).map((t:any)=><option key={t.id||t.href} value={t.href}>{t.label}</option>)}</select></label><label>字号<select aria-label="字号" value={font} onChange={e=>changeFont(Number(e.target.value))}>{[16,18,22,28].map(n=><option key={n}>{n}</option>)}</select></label><button onClick={async()=>{localStorage.removeItem('bookSource');await open(await(await fetch('/books/fixture.epub')).arrayBuffer());}}>测试样书</button><button onClick={async()=>{await open(await(await fetch('/books/moby-dick.epub')).arrayBuffer(),true);}}>公开样书</button><small>收藏主体 {saved.length}<br/>在线词典为英英数据<br/>中文释义尚未接入</small></aside>
    {ctx&&<div className="card" role="dialog" aria-label="单词查询" ref={card} onClick={e=>e.stopPropagation()}><button className="close" aria-label="关闭" onClick={close}>×</button><small>查询 · Free Dictionary API · 英英实测</small><h2>{ctx.lemma}</h2><p>原文：<b data-testid="surface">{ctx.surface}</b> · 推测词性：{ctx.pos}</p><p>{phonetics.find((p:any)=>p.text)?.text||'音标暂缺'} {audio&&<button onClick={()=>void new Audio(audio.startsWith('//')?'https:'+audio:audio).play().catch(e=>setDictError('播放失败：'+e))}>发音</button>}</p><p className="warning">词性为规则推测，不代表具体词义消歧。此服务不提供中文释义。</p>{!entry&&!dictError&&<p>查询中…</p>}{dictError&&<p role="alert">{dictError}<button onClick={()=>setRetry(x=>x+1)}>重试查词</button></p>}{ordered.length>0&&<><p>{ordered[0].partOfSpeech} · {ordered[0].definitions?.[0]?.definition}</p><details><summary>其他释义</summary>{ordered.flatMap((m:any)=>m.definitions.map((d:any,i:number)=><p key={m.partOfSpeech+i}>{m.partOfSpeech} · {d.definition}</p>))}</details></>}
      <blockquote data-testid="sentence">{ctx.sentence.slice(0,ctx.wordStart)}<mark>{ctx.sentence.slice(ctx.wordStart,ctx.wordEnd)}</mark>{ctx.sentence.slice(ctx.wordEnd)}</blockquote><small>{title} · {ctx.href}</small><p><button disabled={transLoading} onClick={()=>setTransRequest({context:ctx,id:Date.now()})}>{transLoading?'翻译中…':'翻译例句'}</button> <button onClick={favorite}>收藏单词及原文</button></p>{translated&&<p data-testid="translation">{translated}</p>}{transError&&<p role="alert">翻译失败，可重试：{transError}</p>}<small>翻译按钮会将当前句子发送至 MyMemory。</small></div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
