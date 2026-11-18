import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star as Bookmark, ChevronLeft, ChevronRight, List, Settings as Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { Header, IconButton } from './common'
import { ContentsPanel, ReadingSettingsPanel } from './ReaderPanels'
import { DictionaryPopover } from './DictionaryPopover'
import { getContext } from '@/lib/services'
import type { Book, Selection } from '@/lib/types'

export function ReaderPage() {
  const { bookId } = useParams(), { allBooks } = useStore()
  const book = allBooks.find(b => b.id === bookId)
  if (!book) return <div className="empty-page"><Header back="/books" /><h1>这本书已不在书架中</h1><p>已收藏的单词与原文仍保留在收藏中。</p><Button nativeButton={false} render={<a href="#/books" />}>返回书架</Button></div>
  return <Reader key={book.id} book={book} />
}
function Reader({ book }: { book: Book }) {
  const { state, setState } = useStore(), navigate = useNavigate()
  const saved = state.progress[book.id]
  const [chapterIndex, setChapterIndex] = useState(Math.max(0, book.chapters.findIndex(c => c.id === saved?.chapterId)))
  const [page, setPage] = useState(0), [pageCount, setPageCount] = useState(1), [pageWidth, setPageWidth] = useState(660)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [panel, setPanel] = useState<'contents' | 'settings' | null>(null)
  const viewport = useRef<HTMLDivElement>(null), flow = useRef<HTMLDivElement>(null)
  const pendingOffset = useRef(saved?.offset ?? 0), currentOffset = useRef(saved?.offset ?? 0)
  const pageRef = useRef(0), pageCountRef = useRef(1), widthRef = useRef(660)
  const [layoutVersion, setLayoutVersion] = useState(0)
  const chapter = book.chapters[chapterIndex], prefs = state.preferences
  useEffect(() => { const obs = new ResizeObserver(() => setLayoutVersion(v => v + 1)); if (viewport.current) obs.observe(viewport.current); return () => obs.disconnect() }, [])
  useLayoutEffect(() => {
    const view = viewport.current, content = flow.current
    if (!view || !content) return
    const width = view.clientWidth
    widthRef.current = width; setPageWidth(width)
    const count = Math.max(1, Math.round((content.scrollWidth + 80) / (width + 80)))
    const words = [...content.querySelectorAll<HTMLElement>('[data-word]')]
    const target = words.find(el => Number(el.dataset.offset) >= pendingOffset.current) ?? words.at(-1)
    let newPage = 0
    if (target) {
      const transformX = new DOMMatrix(getComputedStyle(content).transform).m41
      const x = target.getBoundingClientRect().left - view.getBoundingClientRect().left - transformX
      newPage = Math.max(0, Math.min(count - 1, Math.floor((x + 1) / (width + 80))))
    }
    pageRef.current = newPage; pageCountRef.current = count
    setPageCount(count); setPage(newPage)
    setSelection(null)
  }, [chapterIndex, prefs.font, prefs.fontSize, prefs.lineHeight, prefs.width, layoutVersion])
  useLayoutEffect(() => {
    const view = viewport.current, content = flow.current
    if (!view || !content) return
    if (page !== pageRef.current) return
    const left = view.getBoundingClientRect().left
    content.querySelectorAll<HTMLElement>('[data-paragraph]').forEach(paragraph => {
      paragraph.tabIndex = [...paragraph.querySelectorAll<HTMLElement>('[data-word]')].some(el => { const x = el.getBoundingClientRect().left - left; return x >= -1 && x < widthRef.current - 1 }) ? 0 : -1
    })
    const first = [...content.querySelectorAll<HTMLElement>('[data-word]')].find(el => { const x = el.getBoundingClientRect().left - left; return x >= -1 && x < widthRef.current - 1 })
    const charOffset = Number(first?.dataset.offset ?? 0)
    currentOffset.current = charOffset; pendingOffset.current = charOffset
    setState(s => ({ ...s, progress: { ...s.progress, [book.id]: { bookId: book.id, chapterId: chapter.id, offset: charOffset, updatedAt: Date.now() } } }))
  }, [page, pageWidth, chapter.id, pageCount, book.id, setState])
  function chooseChapter(i: number, offset = 0) { pendingOffset.current = offset; currentOffset.current = offset; setSelection(null); setPanel(null); setChapterIndex(i); setLayoutVersion(v => v + 1) }
  function turn(direction: number) {
    setSelection(null)
    const next = pageRef.current + direction
    if (next < 0 && chapterIndex > 0) { chooseChapter(chapterIndex - 1, Number.MAX_SAFE_INTEGER); return }
    if (next >= pageCountRef.current && chapterIndex < book.chapters.length - 1) { chooseChapter(chapterIndex + 1); return }
    const clamped = Math.max(0, Math.min(pageCountRef.current - 1, next)); pageRef.current = clamped; setPage(clamped)
  }
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key === 'Escape' && panel && !selection) { setPanel(null); return }
      if (selection || panel || target.closest('input,textarea,select,[role="dialog"],[data-paragraph]') || event.ctrlKey || event.altKey || event.metaKey) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); turn(event.key === 'ArrowRight' ? 1 : -1) }
    }
    document.addEventListener('keydown', handle); return () => document.removeEventListener('keydown', handle)
  })
  function selectWord(el: HTMLElement, paragraph: string, paragraphOffset: number) {
    const offset = Number(el.dataset.offset), word = el.textContent ?? ''
    setPanel(null); setSelection({ word: word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, ''), element: el, context: getContext(book, chapterIndex, paragraph, paragraphOffset, offset, word) })
  }
  const paragraphOffsets = chapter.paragraphs.map((_, index) => chapter.paragraphs.slice(0, index).reduce((sum, text) => sum + text.length + 2, 0))
  return <div className="reader-page"><Header back="/books" title={book.title} /><main className="reader-layout">
    <article className="reading-paper" data-testid="reading-paper" style={{ '--reading-width': `${prefs.width}px`, '--reading-font': `"${prefs.font}"`, '--reading-size': `${prefs.fontSize}px`, '--reading-leading': prefs.lineHeight } as React.CSSProperties}>
      <div className="reading-inner"><div className="chapter-heading"><span>Chapter {chapterIndex + 1}</span><h1>{chapter.title}</h1></div>
      <div className="reading-viewport" ref={viewport} data-testid="reading-viewport"><div className="reading-flow" lang="en" ref={flow} style={{ transform: `translateX(-${page * (pageWidth + 80)}px)` }}>
        {chapter.paragraphs.map((paragraph, pi) => {
          const startOffset = paragraphOffsets[pi]
          let tokenOffset = startOffset
          return <p key={`${chapter.id}-${pi}`} data-paragraph tabIndex={0} aria-label={`阅读段落 ${pi + 1}，按 Enter 进入单词选择`} onFocus={e => {
            if (e.target !== e.currentTarget) return
            const firstVisible = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-word]')].find(el => { const r = el.getBoundingClientRect(), v = viewport.current!.getBoundingClientRect(); return r.left >= v.left - 1 && r.right <= v.right + 1 })
            e.currentTarget.querySelectorAll<HTMLElement>('[data-word]').forEach(el => { el.tabIndex = -1 }); if (firstVisible) firstVisible.dataset.keyboard = 'true'
          }} onKeyDown={e => {
            const elements = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-word]')].filter(el => { const r = el.getBoundingClientRect(), v = viewport.current!.getBoundingClientRect(); return r.left >= v.left - 1 && r.right <= v.right + 1 })
            if (!elements.length) return
            const index = elements.indexOf(document.activeElement as HTMLElement)
            if (e.key === 'Enter') { e.preventDefault(); if (index < 0) elements[0].focus({ preventScroll: true }); else selectWord(elements[index], paragraph, startOffset) }
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = Math.max(0, Math.min(elements.length - 1, index + (e.key === 'ArrowRight' ? 1 : -1))); elements[next].focus({ preventScroll: true }) }
          }}>{(paragraph.match(/\S+|\s+/g) ?? []).map((token, ti) => {
            const pos = tokenOffset; tokenOffset += token.length
            if (!/[A-Za-z]/.test(token)) return token
            return <span key={ti} data-word data-offset={pos} tabIndex={-1} role="button" aria-label={`查询 ${token}`} className={selection?.element.dataset.offset === String(pos) ? 'word selected-word' : 'word'} onClick={e => selectWord(e.currentTarget, paragraph, startOffset)}>{token}</span>
          })}</p>
        })}
      </div></div>
      <footer className="page-navigation"><Button variant="outline" disabled={chapterIndex === 0 && page === 0} onClick={() => turn(-1)}><ChevronLeft size={15} /><span>上一页</span></Button><span className="page-count" aria-live="polite">{page + 1}<span className="page-divider">/</span>{pageCount}<small>本章</small></span><Button variant="outline" disabled={chapterIndex === book.chapters.length - 1 && page >= pageCount - 1} onClick={() => turn(1)}><span>下一页</span><ChevronRight size={15} /></Button></footer></div>
    </article>
    <nav className="reader-toolbar" aria-label="阅读工具"><div className="tool-item"><IconButton label="章节目录" active={panel === 'contents'} onClick={() => { setSelection(null); setPanel(p => p === 'contents' ? null : 'contents') }}><List size={23} strokeWidth={1.5} /></IconButton><span>目录</span></div><div className="tool-item"><IconButton label="打开收藏" onClick={() => navigate('/favorites', { state: { from: `/reader/${book.id}` } })}><Bookmark size={22} strokeWidth={1.5} /></IconButton><span>收藏</span></div><div className="tool-item"><IconButton label="阅读设置" active={panel === 'settings'} onClick={() => { setSelection(null); setPanel(p => p === 'settings' ? null : 'settings') }}><Settings2 size={23} strokeWidth={1.5} /></IconButton><span>阅读设置</span></div></nav>
    {panel && <><button className="panel-dismiss" aria-label="关闭阅读面板" onClick={() => setPanel(null)} />{panel === 'contents' ? <ContentsPanel book={book} current={chapterIndex} onChoose={chooseChapter} onClose={() => setPanel(null)} /> : <ReadingSettingsPanel onClose={() => setPanel(null)} />}</>}
  </main>{selection && <DictionaryPopover key={`${selection.context.id}:${selection.context.offset}`} selection={selection} onClose={() => { setSelection(null); selection.element.focus({ preventScroll: true }) }} />}</div>
}
