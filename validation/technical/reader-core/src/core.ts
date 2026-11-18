import nlp from 'compromise';
export type Span={start:number;end:number;text:string};
export function wordAt(text:string,offset:number):Span|undefined {
  for(const m of text.matchAll(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g)) if(offset>=m.index! && offset<m.index!+m[0].length) return {start:m.index!,end:m.index!+m[0].length,text:m[0]};
}
export function sentenceAt(text:string,offset:number):Span {
  // Exact source substrings; no whitespace normalization before DOM mapping.
  const segments=Array.from(new Intl.Segmenter('en',{granularity:'sentence'}).segment(text));
  const groups:Span[]=[];
  for(const s of segments){const prev=groups.at(-1);if(prev&&/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Sr|Jr|e\.g|i\.e)\.\s*$/i.test(prev.text)){prev.end=s.index+s.segment.length;prev.text=text.slice(prev.start,prev.end);}else groups.push({start:s.index,end:s.index+s.segment.length,text:s.segment});}
  for(const s of groups)if(offset>=s.start&&offset<s.end)return s;
  return {start:0,end:text.length,text};
}
export function analyze(sentence:string,word:Span):{lemma:string;pos:string;method:string} {
  const rows=nlp(sentence).json() as any[]; let cursor=0; let tags:string[]=[];
  for(const row of rows)for(const term of row.terms){const index=sentence.indexOf(term.text,cursor);if(index<0)continue;cursor=index+term.text.length;if(word.start>=index && word.start<cursor)tags=term.tags;}
  const pos=tags.includes('Verb')?'verb':tags.includes('Adjective')?'adjective':tags.includes('Adverb')?'adverb':tags.includes('Noun')?'noun':'unknown';
  const surface=word.text.toLowerCase().replaceAll('’',"'"); let lemma=surface;
  if(pos==='verb') lemma=nlp(surface).verbs().toInfinitive().text()||surface;
  if(pos==='noun') lemma=nlp(surface).nouns().toSingular().text()||surface;
  return {lemma:lemma.toLowerCase(),pos,method:'compromise heuristic; no semantic disambiguation'};
}
export function textMap(root:Element) {
  const nodes:{node:Text;start:number;end:number}[]=[];let text='';
  const walker=root.ownerDocument.createTreeWalker(root,4); let node:Node|null;
  while((node=walker.nextNode())) {if(node.parentElement?.closest('script,style,noscript,[hidden]'))continue;const start=text.length;text+=node.textContent||'';nodes.push({node:node as Text,start,end:text.length});}
  return {text,nodes,range(start:number,end:number){const a=nodes.find(n=>start>=n.start&&start<n.end);const b=nodes.find(n=>end>n.start&&end<=n.end);if(!a||!b)throw Error('DOM range unavailable');const range=root.ownerDocument.createRange();range.setStart(a.node,start-a.start);range.setEnd(b.node,end-b.start);return range;}};
}
export type Context={surface:string;lemma:string;pos:string;sentence:string;wordStart:number;wordEnd:number;cfi:string;href:string;bookHash:string;quote:{exact:string;prefix:string;suffix:string};range:Range;iframe:HTMLIFrameElement};
export function contextFromPoint(doc:Document,x:number,y:number,contents:any,bookHash:string):Context|undefined {
  const caret=(doc as any).caretPositionFromPoint?.(x,y);const fallback=(doc as any).caretRangeFromPoint?.(x,y);
  const node:Node|undefined=caret?.offsetNode||fallback?.startContainer;const offset:number=caret?.offset??fallback?.startOffset;
  if(!node||node.nodeType!==3||node.parentElement?.closest('a'))return;
  const block=node.parentElement?.closest('p,li,blockquote,h1,h2,h3,td,figcaption')||node.parentElement!;
  const map=textMap(block);const entry=map.nodes.find(n=>n.node===node);if(!entry)return;
  const word=wordAt(map.text,entry.start+offset);if(!word)return;
  const range=map.range(word.start,word.end);if(!Array.from(range.getClientRects()).some(r=>x>=r.left-1&&x<=r.right+1&&y>=r.top-1&&y<=r.bottom+1))return;
  const sentence=sentenceAt(map.text,word.start);const local={...word,start:word.start-sentence.start,end:word.end-sentence.start};
  const result=analyze(sentence.text,local);
  return {surface:word.text,...result,sentence:sentence.text,wordStart:local.start,wordEnd:local.end,cfi:contents.cfiFromRange(range),href:contents.sectionIndex+'',bookHash,quote:{exact:word.text,prefix:map.text.slice(Math.max(0,word.start-48),word.start),suffix:map.text.slice(word.end,word.end+48)},range,iframe:doc.defaultView!.frameElement as HTMLIFrameElement};
}
export function outerRect(ctx:Pick<Context,'range'|'iframe'>) {
  const r=Array.from(ctx.range.getClientRects()).find(r=>r.width>0)||ctx.range.getBoundingClientRect(); const f=ctx.iframe.getBoundingClientRect();
  const sx=f.width/ctx.iframe.clientWidth||1,sy=f.height/ctx.iframe.clientHeight||1;
  return new DOMRect(f.left+r.left*sx,f.top+r.top*sy,r.width*sx,r.height*sy);
}
