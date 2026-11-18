async (page) => {
 await page.goto('http://127.0.0.1:4173/'); await page.waitForSelector('[data-word]');
 const get = () => page.evaluate(()=>{const style=getComputedStyle(document.body),root=getComputedStyle(document.documentElement),button=getComputedStyle(document.querySelector('.page-navigation button'));return {font:style.fontFamily,rootFont:root.fontFamily,primary:root.getPropertyValue('--primary'),green:root.getPropertyValue('--green'),buttonBg:button.backgroundColor,buttonColor:button.color,buttonStyle:document.querySelector('.page-navigation button').outerHTML}});
 const light=await get(); await page.getByRole('button',{name:'阅读设置',exact:true}).click();await page.getByRole('button',{name:'深色',exact:true}).click();const dark=await get(); return {light,dark};
}
