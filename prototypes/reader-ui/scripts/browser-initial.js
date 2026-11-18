async (page) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForSelector('[data-word]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: outputDir + '/reader-initial.png' });
  const metrics = await page.evaluate(() => { const f = document.querySelector('.reading-flow'), v = document.querySelector('.reading-viewport'); return { flowWidth: f.clientWidth, scrollWidth: f.scrollWidth, height: f.clientHeight, viewport: v.getBoundingClientRect().toJSON(), count: document.querySelector('.page-count').textContent, color: getComputedStyle(document.documentElement).getPropertyValue('--canvas') } });
  await page.locator('[data-word]').filter({ hasText: /^acknowledged,$/ }).click();
  await page.waitForSelector('.entry-title');
  await page.screenshot({ path: outputDir + '/dictionary-initial.png' });
  return { errors, metrics, snapshot: await page.locator('.dictionary-popover').innerText() };
}
