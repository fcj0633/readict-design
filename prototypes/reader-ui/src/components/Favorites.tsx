import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Star as Bookmark, Search, Trash2, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Header, ContextSentence, ConfirmDialog } from './common'
import { useStore } from '@/lib/store'
import type { FavoriteWord, WordContext } from '@/lib/types'

export function FavoritesPage() {
  const { state, setState, allBooks } = useStore(), location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/reader/pride'
  const [view, setView] = useState('words'), [query, setQuery] = useState(''), [source, setSource] = useState('all'), [sort, setSort] = useState('new')
  const [detail, setDetail] = useState<string | null>(null), [deleting, setDeleting] = useState<string | null>(null)
  const detailWord = state.favorites.find(f => f.lemma === detail)
  const sourceBooks = [...new Map(state.favorites.flatMap(f => f.contexts.map(c => [c.bookId, c.bookTitle] as const))).entries()]
  const q = query.trim().toLowerCase()
  const matchContext = (c: WordContext) => (source === 'all' || c.bookId === source) && (c.sentence.toLowerCase().includes(q) || state.favorites.some(f => f.contexts.some(ctx => ctx.id === c.id) && f.lemma.includes(q)))
  const filtered = state.favorites.filter(f => f.contexts.some(c => (source === 'all' || c.bookId === source) && (f.lemma.includes(q) || c.sentence.toLowerCase().includes(q)))).sort((a, b) => sort === 'new' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt)
  function contextSource(c: WordContext) {
    const exists = allBooks.some(b => b.id === c.bookId)
    return <div className="favorite-context-source"><span>{c.bookTitle} · {c.chapterTitle}</span>{exists ? <Link to={`/reader/${c.bookId}`} onClick={() => setState(s => ({ ...s, progress: { ...s.progress, [c.bookId]: { bookId: c.bookId, chapterId: c.chapterId, offset: c.offset, updatedAt: Date.now() } } }))}>回到原文<ArrowUpRight size={12} /></Link> : <span className="muted">原书已删除</span>}</div>
  }
  return <div className="library-page"><Header back={allBooks.some(b => `/reader/${b.id}` === from) ? from : '/books'}><Link className="nav-link" to="/books">我的书架</Link></Header><main className="library-main favorites-main"><div className="page-title-row"><div><p className="eyebrow">把遇见的词，留在它的语境里</p><h1>收藏<span className="title-count">{state.favorites.length}</span></h1></div><span className="muted">{state.favorites.reduce((sum, f) => sum + f.contexts.length, 0)} 条原文语境</span></div>
    <div className="favorites-controls"><Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="words">单词</TabsTrigger><TabsTrigger value="sentences">句子</TabsTrigger></TabsList></Tabs><label className="search-field"><Search size={16} /><input aria-label="搜索收藏" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索单词或原文句子" /></label><select aria-label="来源书籍" value={source} onChange={e => setSource(e.target.value)}><option value="all">全部书籍</option>{sourceBooks.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select><select aria-label="收藏排序" value={sort} onChange={e => setSort(e.target.value)}><option value="new">最近收藏</option><option value="old">最早收藏</option></select></div>
    {filtered.length === 0 ? <div className="empty-state"><Bookmark size={32} strokeWidth={1.2} /><h2>{state.favorites.length ? '没有符合条件的收藏' : '把值得记住的词留下来'}</h2><p>{state.favorites.length ? '试试其他关键词，或查看全部书籍。' : '阅读时点击一个单词，再收藏它和所在的原文句子。'}</p>{state.favorites.length ? <Button variant="outline" onClick={() => { setQuery(''); setSource('all') }}>清除筛选</Button> : <Button nativeButton={false} render={<Link to={from} />}>去阅读</Button>}</div> : view === 'words' ? <div className="favorite-word-list">{filtered.map(f => <article key={f.lemma} className="favorite-word-row"><button className="favorite-word-open" onClick={() => setDetail(f.lemma)}><div className="favorite-lemma"><h2>{f.lemma}</h2><span>{f.ipa}</span></div><p><span className="muted">{f.sense.pos}</span> {f.sense.meaning}</p><small>{f.contexts.length} 条原文语境</small></button><Button variant="ghost" size="icon" aria-label={`取消收藏 ${f.lemma}`} onClick={() => setDeleting(f.lemma)}><Trash2 size={16} /></Button></article>)}</div> : <div className="favorite-sentence-list">{filtered.flatMap(f => f.contexts.filter(matchContext).map(c => <article key={`${f.lemma}:${c.id}`}><button className="sentence-lemma" onClick={() => setDetail(f.lemma)}>{f.lemma}</button><ContextSentence context={c} />{(state.translations[c.id] ?? c.translation) && <p className="favorite-translation">{state.translations[c.id] ?? c.translation}</p>}{contextSource(c)}</article>))}</div>}
    <p className="prototype-note">收藏按单词原型归并 · 释义仅为示例数据 · 资料保存在当前浏览器</p>
  </main><Dialog open={!!detailWord} onOpenChange={v => !v && setDetail(null)}><DialogContent className="readict-dialog favorite-detail"><DialogHeader><DialogTitle className="favorite-detail-title">{detailWord?.lemma}</DialogTitle><DialogDescription>{detailWord?.ipa}　{detailWord?.sense.pos} {detailWord?.sense.meaning}</DialogDescription></DialogHeader>{detailWord && <FavoriteDetail word={detailWord} source={contextSource} translations={state.translations} />}<Button variant="outline" onClick={() => setDeleting(detailWord!.lemma)}>取消收藏这个单词</Button></DialogContent></Dialog>
  <ConfirmDialog open={!!deleting} title={`取消收藏 ${deleting}？`} description="将移除这个单词及其全部关联原文句子。书籍和公共词典数据不受影响。" onClose={() => setDeleting(null)} onConfirm={() => { setState(s => ({ ...s, favorites: s.favorites.filter(f => f.lemma !== deleting) })); if (detail === deleting) setDetail(null); setDeleting(null); toast.success('已取消收藏') }} /></div>
}
function FavoriteDetail({ word, source, translations }: { word: FavoriteWord; source: (context: WordContext) => React.ReactNode; translations: Record<string, string> }) {
  return <div className="favorite-detail-contexts">{word.contexts.map(c => <article key={c.id}><ContextSentence context={c} />{(translations[c.id] ?? c.translation) && <p className="favorite-translation">{translations[c.id] ?? c.translation}</p>}{source(c)}</article>)}<p className="muted text-xs">收藏于 {new Date(word.createdAt).toLocaleString('zh-CN')}</p></div>
}
