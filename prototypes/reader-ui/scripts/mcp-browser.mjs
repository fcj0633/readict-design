import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const outputDir = path.resolve(projectRoot, process.env.READICT_UX_OUTPUT_DIR || '.artifacts/ux')
await mkdir(outputDir, { recursive: true })

const client = new Client({ name: 'readict-ux-verification', version: '1.0.0' })
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(projectRoot, 'node_modules/@playwright/mcp/cli.js'), '--isolated', '--headless', '--browser', 'chrome', '--viewport-size', '1440,900', '--output-dir', outputDir] })
try {
  await client.connect(transport)
  const listed = await client.listTools()
  if (process.argv[2] === '--list') { console.log(listed.tools.map(t => t.name).join('\n')) }
  else {
    const name = listed.tools.find(t => /browser_run_code/.test(t.name))?.name
    if (!name) throw Error('MCP browser_run_code tool is unavailable')
    const code = await readFile(path.resolve(projectRoot, process.argv[2] ?? 'scripts/browser-check.js'), 'utf8')
    const wrapped = `async (page) => { const outputDir = ${JSON.stringify(outputDir.replaceAll('\\', '/'))}; try { return await (${code})(page); } catch (error) { await page.screenshot({path: outputDir + '/check-failure.png'}); throw error; } }`
    const response = await client.callTool({ name, arguments: { code: wrapped } }, undefined, { timeout: 180000 })
    await writeFile(path.join(outputDir, 'mcp-last-result.json'), JSON.stringify(response, null, 2))
    const resultBlock = response.content?.find(block => block.type === 'text' && block.text.includes('### Result\n'))
    if (resultBlock && !response.isError) {
      const jsonLine = resultBlock.text.split('### Result\n')[1].split('\n')[0]
      const filename = path.basename(process.argv[2] ?? 'scripts/browser-check.js', '.js')
      await writeFile(path.join(outputDir, `${filename}-results.json`), JSON.stringify(JSON.parse(jsonLine), null, 2))
    }
    for (const block of response.content ?? []) if (block.type === 'text') console.log(block.text)
    if (response.isError) process.exitCode = 1
  }
} finally { await client.close() }
