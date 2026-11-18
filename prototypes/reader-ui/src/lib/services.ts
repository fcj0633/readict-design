import { getEntry, normalize, translationSamples } from '@/data/mock'
import type { Book, FavoriteWord, WordContext, DictionaryEntry, Sense } from './types'

export function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve() }, ms)
    signal?.addEventListener('abort', abort, { once: true })
  })
}
const failed = new Set<string>()
export const mockService = {
  async lookup(word: string, signal?: AbortSignal) {
    await delay(380, signal)
    if (normalize(word) === 'timeout' && !failed.has('lookup')) { failed.add('lookup'); throw new Error('词典查询超时，请重试') }
    return getEntry(word)
  },
  async translate(context: WordContext, signal?: AbortSignal) {
    await delay(1100, signal)
    if (context.sentence.includes('storm') && !failed.has(context.id)) { failed.add(context.id); throw new Error('翻译暂时不可用，请重试') }
    return translationSamples[context.sentence] ?? '这段原文的完整翻译暂未收录。当前为交互演示，后续将接入真实翻译服务。'
  },
  async save(lemma: string, signal?: AbortSignal) {
    await delay(240, signal)
    if (lemma === 'archive' && !failed.has('save')) { failed.add('save'); throw new Error('收藏保存失败，请重试') }
  },
  async importBook(file: File, template: Book, signal?: AbortSignal): Promise<Book> {
    if (!file.name.toLowerCase().endsWith('.epub')) throw new Error('请选择 .epub 格式的文件')
    if (!file.size) throw new Error('文件为空，请重新选择')
    if (file.size > 50 * 1024 * 1024) throw new Error('文件超过 50 MB，请选择更小的 EPUB')
    await delay(1200, signal)
    if (/fail|drm/i.test(file.name)) throw new Error('模拟解析失败：暂不支持此文件，请重新选择')
    return { ...template, id: `import-${crypto.randomUUID()}`, title: file.name.replace(/\.epub$/i, ''), subtitle: '模拟导入 · 使用内置样书正文', imported: true }
  },
}

export function mergeFavorite(list: FavoriteWord[], entry: DictionaryEntry, sense: Sense, context: WordContext): FavoriteWord[] {
  const existing = list.find(item => item.lemma === entry.lemma)
  if (!existing) return [...list, { lemma: entry.lemma, ipa: entry.ipa, sense, createdAt: Date.now(), contexts: [context] }]
  if (existing.contexts.some(item => item.id === context.id)) return list
  return list.map(item => item.lemma === entry.lemma ? { ...item, contexts: [...item.contexts, context] } : item)
}

export function getContext(book: Book, chapterIndex: number, paragraph: string, paragraphOffset: number, wordOffset: number, word: string): WordContext {
  const local = wordOffset - paragraphOffset
  const sentences = [...paragraph.matchAll(/[^.!?]+(?:[.!?]+[”’"']?|$)/g)]
  const match = sentences.find(item => item.index! <= local && item.index! + item[0].length > local)
  const raw = match?.[0] ?? paragraph
  const leading = raw.length - raw.trimStart().length
  const sentence = raw.trim(), sentenceOffset = paragraphOffset + (match?.index ?? 0) + leading
  const start = wordOffset - sentenceOffset
  return { id: `${book.id}:${book.chapters[chapterIndex].id}:${sentenceOffset}`, bookId: book.id, bookTitle: book.title, chapterId: book.chapters[chapterIndex].id, chapterTitle: book.chapters[chapterIndex].title, sentence, original: word, start, end: start + word.length, offset: wordOffset }
}
