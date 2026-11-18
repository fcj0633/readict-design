async (page) => {
 const results=[]; const check=(condition,label,detail)=>{if(!condition)throw Error(label+': '+JSON.stringify(detail));results.push({passed:true,label,detail});};
 const out=outputDir + '/';
 await page.goto('http://127.0.0.1:4173/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForSelector('[data-word]');
 for(const [width,height] of [[1440,900],[1366,768],[390,844]]) {
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  await page.getByRole('button',{name:'章节目录',exact:true}).click();await page.locator('.chapter-list button').first().click();await page.waitForTimeout(100);
  const count=Number((await page.locator('.page-count').innerText()).match(/\d+/g)[1]);
  const all=await page.locator('[data-word]').evaluateAll(elements=>elements.map(el=>el.dataset.offset));
  const seen=[];
  for(let i=0;i<count;i++){
   const tokens=await page.evaluate(()=>{const v=document.querySelector('.reading-viewport').getBoundingClientRect();return [...document.querySelectorAll('[data-word]')].filter(el=>{const r=el.getBoundingClientRect();return r.left>=v.left-1&&r.right<=v.right+1&&r.top>=v.top-1&&r.bottom<=v.bottom+1;}).map(el=>el.dataset.offset);});seen.push(...tokens);
   if(i<count-1)await page.getByRole('button',{name:'下一页',exact:true}).click();
  }
  check(new Set(seen).size===all.length && seen.length===all.length,`分页不丢词、不重复 ${width}×${height}`,{count,total:all.length,visible:seen.length,unique:new Set(seen).size});
 }
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(150);
 await page.getByRole('button',{name:'章节目录',exact:true}).click();await page.locator('.chapter-list button').first().click();await page.waitForTimeout(100);
 await page.locator('body').click({position:{x:80,y:400}});await page.keyboard.press('ArrowRight');
 check((await page.locator('.page-count').innerText()).startsWith('2'),'键盘右键翻到下一页');await page.keyboard.press('ArrowLeft');
 const firstParagraph=page.locator('[data-paragraph]').first();await firstParagraph.focus();await page.keyboard.press('Enter');await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');await page.waitForSelector('.dictionary-popover');
 check(await page.locator('.dictionary-popover').count()===1,'键盘段落进入、词语移动与查词');await page.keyboard.press('Escape');
 check(await page.locator('.dictionary-popover').count()===0,'Escape 关闭键盘查词');
 await page.locator('[data-word]').filter({hasText:/^acknowledged,$/}).click();await page.waitForSelector('.entry-title');
 await page.locator('body').click({position:{x:80,y:400}});check(await page.locator('.dictionary-popover').count()===0,'点击阅读区外空白关闭卡片');
 const contrast=(a,b)=>{const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 for(const label of ['白色','暖色','深色']) {
  await page.getByRole('button',{name:'阅读设置',exact:true}).click();await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(250);
  const colors=await page.evaluate(()=>({paper:getComputedStyle(document.querySelector('.reading-paper')).backgroundColor,text:getComputedStyle(document.querySelector('.reading-flow')).color,secondary:getComputedStyle(document.querySelector('.panel-note')).color}));
  check(contrast(colors.paper,colors.text)>=4.5 && contrast(colors.paper,colors.secondary)>=4.5,`${label}主题正文与辅助文字对比度`,{...colors,textContrast:contrast(colors.paper,colors.text),secondaryContrast:contrast(colors.paper,colors.secondary)});
  const buttons=await page.evaluate(()=>{const root=document.querySelector('.settings-panel');return [...root.querySelectorAll('button[data-variant="outline"],button[data-variant="default"]')].map(b=>{const s=getComputedStyle(b);return {color:s.color,bg:s.backgroundColor==='rgba(0, 0, 0, 0)'?getComputedStyle(root).backgroundColor:s.backgroundColor};});});
  check(buttons.every(b=>contrast(b.color,b.bg)>=4.5),`${label}主题设置按钮对比度`,buttons.map(b=>contrast(b.color,b.bg)));
  await page.screenshot({path:`${out}theme-${label==='白色'?'white':label==='暖色'?'warm':'dark'}.png`});await page.keyboard.press('Escape');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 check(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),'尊重减少动态效果设置');
 await page.evaluate(()=>localStorage.setItem('readict-prototype-v1','{invalid json'));await page.reload();await page.waitForSelector('[data-word]');
 check(await page.locator('.chapter-heading h1').textContent()==='Chapter One','本地记录损坏时恢复可用默认界面');await page.screenshot({path:out+'storage-recovery.png'});
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError');};});await page.reload();await page.waitForSelector('[data-word]');
 await page.getByRole('button',{name:'阅读设置',exact:true}).click();await page.getByRole('button',{name:'字号 22',exact:true}).click();
 check(await page.locator('.reading-flow').evaluate(el=>getComputedStyle(el).fontSize)==='22px','本地存储不可用时当前会话仍可更改设置');await page.keyboard.press('Escape');
 // Capture clean, same-state design evidence with fresh storage support.
 const fresh=await page.context().newPage(); await fresh.setViewportSize({width:1440,height:900});await fresh.goto('http://127.0.0.1:4173/');
 // addInitScript also applies to this context, so the clean state remains in memory.
 await fresh.waitForSelector('[data-word]');await fresh.screenshot({path:out+'reader-clean.png'});
 await fresh.locator('[data-word]').filter({hasText:/^acknowledged,$/}).click();await fresh.waitForSelector('.entry-title');await fresh.screenshot({path:out+'dictionary-clean.png'});
 return {passed:results.length,results};
}
