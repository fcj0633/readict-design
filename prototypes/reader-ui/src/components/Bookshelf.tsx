import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, Star as Bookmark, FileUp, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Header, ConfirmDialog } from './common'
import { useStore } from '@/lib/store'
import { mockService } from '@/lib/services'
import { books } from '@/data/mock'
import type { Book } from '@/lib/types'

export function BookshelfPage() {
  const { allBooks, state, setState } = useStore()
  const [query, setQuery] = useState(''), [importOpen, setImportOpen] = useState(false)
  const [deleting, setDeleting] = useState<Book | null>(null)
  const visible = allBooks.filter(b => `${b.title} ${b.author} ${b.subtitle}`.toLowerCase().includes(query.toLowerCase()))
  const recent = [...allBooks].sort((a, b) => (state.progress[b.id]?.updatedAt ?? 0) - (state.progress[a.id]?.updatedAt ?? 0))[0]
  return <div className="library-page"><Header><Link to="/favorites" className="nav-link"><Bookmark size={17} />收藏<span className="count-badge">{state.favorites.length}</span></Link></Header>
    <main className="library-main"><div className="page-title-row"><div><p className="eyebrow">每一页，都有新的发现</p><h1>我的书架<span className="title-count">{allBooks.length}</span></h1></div><Button onClick={() => setImportOpen(true)}><Plus size={17} />导入 EPUB</Button></div>
      {recent && !query && <section className="continue-reading"><div><span className="section-caption">{state.progress[recent.id] ? '继续上次的阅读' : '从一本书开始'}</span><h2>{recent.title}</h2><p>{recent.author}{state.progress[recent.id] ? ` · ${recent.chapters.find(c => c.id === state.progress[recent.id].chapterId)?.title ?? 'Chapter One'}` : ' · 英文原版节选'}</p></div><Button variant="outline" nativeButton={false} render={<Link to={`/reader/${recent.id}`} />}>继续阅读<ArrowUpRight size={16} /></Button></section>}
      <div className="library-list-heading"><h2>全部书籍</h2><label className="search-field"><Search size={16} /><input aria-label="搜索书籍" placeholder="搜索书名或作者" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      {visible.length > 0 ? <div className="book-grid">{visible.map(book => {
        const progress = state.progress[book.id], chapterIndex = book.chapters.findIndex(c => c.id === progress?.chapterId)
        const chapterLength = book.chapters[Math.max(0, chapterIndex)].paragraphs.join('\n\n').length
        const percent = progress ? Math.round((Math.max(0, chapterIndex) + Math.min(1, progress.offset / chapterLength)) / book.chapters.length * 100) : 0
        return <article className="book-item" key={book.id}><Link to={`/reader/${book.id}`} className="book-cover-link" aria-label={`阅读 ${book.title}`}><img src={book.cover} alt={`${book.title} 封面`} /><span className="book-open-label"><BookOpen size={16} />开始阅读</span></Link><div className="book-details"><Link to={`/reader/${book.id}`}><h3>{book.title}</h3></Link><p>{book.author}</p><span className="book-subtitle">{book.subtitle}</span><div className="book-progress"><progress max="100" value={percent} aria-label={`${book.title} 阅读进度`} /><span>{progress ? `已读 ${percent}%` : '还未开始'}</span></div><div className="book-meta"><span>{progress ? new Date(progress.updatedAt).toLocaleDateString('zh-CN') : `${book.chapters.length} 章精选`}</span><Button variant="ghost" size="icon-sm" aria-label={`删除 ${book.title}`} onClick={() => setDeleting(book)}><Trash2 size={14} /></Button></div></div></article>
      })}</div> : <div className="empty-state"><BookOpen size={30} strokeWidth={1.2} /><h2>{query ? '没有找到这本书' : '书架还空着'}</h2><p>{query ? '换个书名或作者试试。' : '导入一本 EPUB，开始你的原版阅读。'}</p><Button variant="outline" onClick={() => query ? setQuery('') : setImportOpen(true)}>{query ? '清除搜索' : '导入 EPUB'}</Button></div>}
      <p className="prototype-note">交互原型 · 内置样书与示例词典 · 阅读记录仅保存在当前浏览器</p>
    </main><ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    <ConfirmDialog open={!!deleting} title={`删除《${deleting?.title}》？`} description="将移除书架中的书籍和阅读进度，已收藏的单词与原文句子会继续保留。" onClose={() => setDeleting(null)} onConfirm={() => { if (!deleting) return; setState(s => { const progress = { ...s.progress }; delete progress[deleting.id]; return { ...s, removedBooks: [...s.removedBooks, deleting.id], progress } }); setDeleting(null); toast.success('已删除书籍，收藏资料已保留') }} />
  </div>
}
function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setState } = useStore(), [status, setStatus] = useState('idle'), [message, setMessage] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  async function importFile(file?: File) {
    if (!file) return
    abortRef.current?.abort(); const abort = new AbortController(); abortRef.current = abort; setStatus('loading'); setMessage(file.name)
    try {
      const book = await mockService.importBook(file, books[0], abort.signal)
      setState(s => ({ ...s, importedBooks: [...s.importedBooks, book] })); setStatus('success'); setMessage('模拟导入完成，正文使用内置样书。'); toast.success('已加入书架')
    } catch (error) { if ((error as Error).name !== 'AbortError') { setStatus('error'); setMessage((error as Error).message) } }
  }
  function close() { abortRef.current?.abort(); setStatus('idle'); setMessage(''); onClose() }
  return <Dialog open={open} onOpenChange={v => !v && close()}><DialogContent className="readict-dialog"><DialogHeader><DialogTitle>导入一本书</DialogTitle><DialogDescription>当前为模拟导入，不解析或上传文件。成功后使用内置样书正文演示阅读。</DialogDescription></DialogHeader><label className={`import-drop ${status === 'loading' ? 'busy' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (status !== 'loading') void importFile(e.dataTransfer.files[0]) }}><FileUp size={30} strokeWidth={1.2} /><span>选择文件，或将 EPUB 拖到这里</span><small>.epub 格式 · 最大 50 MB</small><input aria-label="选择 EPUB 文件" type="file" accept=".epub" disabled={status === 'loading'} onChange={e => { void importFile(e.target.files?.[0]); e.target.value = '' }} /></label>{message && <p className={`import-status ${status === 'error' ? 'error' : ''}`} role="status">{status === 'loading' && <Loader2 className="spin" size={15} />}{status === 'loading' ? `正在模拟解析 ${message}…` : message}</p>}<p className="muted text-xs">文件名包含 fail 或 drm 时可体验导入失败状态。</p>{status === 'success' && <Button onClick={close}>返回书架</Button>}</DialogContent></Dialog>
}
