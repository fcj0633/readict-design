async (page) => {
 const out=outputDir + '/';
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('[data-word]');await page.waitForTimeout(150);
 await page.screenshot({path:out+'reader-clean.png'});
 await page.locator('[data-word]').filter({hasText:/^acknowledged,$/}).click();await page.waitForSelector('.entry-title');await page.waitForTimeout(100);
 await page.screenshot({path:out+'dictionary-clean.png'});
 return {url:page.url(),viewport:page.viewportSize(),state:'warm theme, chapter one, acknowledged selected, no translation, unsaved'};
}
