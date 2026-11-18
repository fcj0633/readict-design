import JSZip from 'jszip';
import DOMPurify from 'dompurify';
export async function prepareBook(buffer:ArrayBuffer) {
  if(buffer.byteLength>25*1024*1024)throw Error('实验限制：EPUB 不得超过 25 MiB');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const zip=await JSZip.loadAsync(buffer);const entries=Object.values(zip.files);if(entries.length>2500)throw Error('ZIP 条目过多');
  let size=0;for(const e of entries){size+=(e as any)._data?.uncompressedSize||0;if(size>80*1024*1024)throw Error('解压后尺寸超过 80 MiB');if((e as any).unsafeOriginalName?.split('/').includes('..'))throw Error('非法资源路径');}
  if(await zip.file('mimetype')?.async('string')!=='application/epub+zip')throw Error('不是有效 EPUB');
  if(zip.file('META-INF/encryption.xml'))throw Error('实验暂不支持带 encryption.xml 的 EPUB（含字体混淆）');
  for(const e of entries){if(e.dir)continue;
    if(/\.(opf|xml)$/i.test(e.name)){const xml=await e.async('string');if(/<!ENTITY/i.test(xml))throw Error('不支持 XML 实体声明');if(/rendition:layout[^<]*>pre-paginated/i.test(xml))throw Error('暂不支持固定版式 EPUB');}
    if(/\.(xhtml|html|htm|svg)$/i.test(e.name)){
      const source=await e.async('string');if(/<!ENTITY/i.test(source))throw Error('不支持 XML 实体声明');
      const input=source.replace(/^\uFEFF?/,'').replace(/<\?xml[^?]*\?>/gi,'').replace(/<!DOCTYPE[^>]*>/gi,'');
      const parsed=new DOMParser().parseFromString(input,'application/xhtml+xml');if(parsed.querySelector('parsererror'))throw Error('原始 XHTML 无法解析：'+e.name);
      const clean=DOMPurify.sanitize(input,{WHOLE_DOCUMENT:true,PARSER_MEDIA_TYPE:'application/xhtml+xml',ADD_TAGS:['link','meta'],ADD_ATTR:['epub:type','xmlns:epub'],FORBID_TAGS:['script','iframe','object','embed','form','base','animate','set','foreignObject']});
      const doc=new DOMParser().parseFromString(clean,'application/xhtml+xml');if(doc.querySelector('parsererror'))throw Error('XHTML 无法安全解析');
      doc.querySelectorAll('*').forEach(el=>{for(const attr of Array.from(el.attributes)){if(/^on/i.test(attr.name)||/^(src|href|xlink:href|poster|action)$/i.test(attr.name)&&/^\s*(?:https?:|\/\/|javascript:|data:text\/html)/i.test(attr.value))el.removeAttribute(attr.name);if(attr.name==='style'&&/url\s*\(|@import/i.test(attr.value))el.removeAttribute('style');}});
      doc.querySelectorAll('style').forEach(el=>el.textContent=filterCss(el.textContent||''));
      // Applied before iframe navigation, so untrusted documents cannot issue remote requests.
      const meta=doc.createElementNS('http://www.w3.org/1999/xhtml','meta');meta.setAttribute('http-equiv','Content-Security-Policy');meta.setAttribute('content',"default-src 'none'; img-src blob: data:; style-src 'unsafe-inline' blob:; font-src blob: data:; script-src 'none'; connect-src 'none'; frame-src 'none'");doc.querySelector('head')?.prepend(meta);
      // DOMPurify's XHTML whole-document mode wraps SVG in HTML; SVG assets need an SVG root.
      const output=/\.svg$/i.test(e.name)?doc.querySelector('svg'):doc;
      if(!output)throw Error('SVG 无法安全解析');
      zip.file(e.name,new XMLSerializer().serializeToString(output));
    }else if(/\.css$/i.test(e.name))zip.file(e.name,filterCss(await e.async('string')));
  }
  return {hash,buffer:await zip.generateAsync({type:'arraybuffer',compression:'STORE'})};
}
function filterCss(css:string){return css.replace(/@import[^;]*;/gi,'').replace(/url\(\s*(['"]?)(?:https?:|\/\/)[^)]*\)/gi,'none');}
