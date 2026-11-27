import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileUp, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '../components/common';
import { useStore } from '@/lib/store';
import { mockService } from '@/lib/services';
import { books } from '@/data/mock';
import type { Book, ReadingLocation } from '@/lib/types';
function coverFor(book: Book) {
  return ['pride', 'garden', 'jane', 'gatsby', 'moby', 'little-women'].includes(book.id) ? `/user-center/covers/${book.id}.jpg` : book.cover;
}
function readingPercent(book: Book, location?: ReadingLocation) {
  if (!location) return 0;
  const index = Math.max(0, book.chapters.findIndex(chapter => chapter.id === location.chapterId));
  const length = book.chapters[index].paragraphs.join('\n\n').length;
  return Math.min(100, Math.round((index + Math.min(1, location.offset / Math.max(1, length))) / book.chapters.length * 100));
}
export function BookshelfPage() {
  const {
    allBooks,
    state,
    setState
  } = useStore();
  const [query, setQuery] = useState(''),
    [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const visible = allBooks.filter(book => `${book.title} ${book.author} ${book.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));
  const recent = [...allBooks].sort((a, b) => (state.progress[b.id]?.updatedAt ?? 0) - (state.progress[a.id]?.updatedAt ?? 0))[0];
  const recentLocation = recent && state.progress[recent.id];
  const percent = recent ? readingPercent(recent, recentLocation) : 0;
  return <div className="quiet-library">
    <main className="ql-main">
      <div className="ql-page-heading"><div className="ql-title"><h1>我的书架</h1><span>{allBooks.length ? `${allBooks.length} 本原版书，等你翻开` : '你的原版阅读空间'}</span></div>{allBooks.length > 0 && <Button className="ql-import-button" onClick={() => setImportOpen(true)}><Plus size={17} />导入 EPUB</Button>}</div>
      {recent && <section className="ql-continue" aria-labelledby="continue-title">
        <Link to={`/reader/${recent.id}`} className="ql-continue-cover" aria-label={`继续阅读 ${recent.title}`}><img src={coverFor(recent)} alt={`${recent.title} 封面`} /></Link>
        <div className="ql-continue-info"><div className="ql-section-label"><span className="ql-reading-dot" />{recentLocation ? '继续阅读' : '开启一段新的阅读'}</div><h2 id="continue-title" lang="en">{recent.title}</h2><p className="ql-continue-author" lang="en">{recent.author}<span>{recent.subtitle}</span></p><div className="ql-location"><BookOpen size={15} strokeWidth={1.5} /><span>{recentLocation ? '上次读到' : '从这里开始'}</span><b lang="en">{recent.chapters.find(chapter => chapter.id === recentLocation?.chapterId)?.title ?? recent.chapters[0].title}</b></div><div className="ql-continue-progress"><progress max="100" value={percent} aria-label="当前书籍阅读进度" /><span>{recentLocation ? `已读 ${percent}%` : '还未开始'}</span></div></div>
        <div className="ql-continue-action"><Button className="ql-resume-button" nativeButton={false} render={<Link to={`/reader/${recent.id}`} />}>{recentLocation ? '继续阅读' : '开始阅读'}<ArrowRight size={18} strokeWidth={1.5} /></Button></div>
      </section>}
      <section className="ql-shelf" aria-labelledby="shelf-title"><div className="ql-shelf-heading"><div><h2 id="shelf-title">全部书籍</h2><span>{query ? `找到 ${visible.length} 本` : `${allBooks.length} 本`}</span></div><label className="ql-search"><Search size={17} strokeWidth={1.6} /><input aria-label="搜索书籍" placeholder="搜索书名或作者" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="清除搜索" onClick={() => setQuery('')}><X size={14} /></button>}</label></div>
        {visible.length ? <div className="ql-book-grid">{visible.map(book => {
            const location = state.progress[book.id],
              progress = readingPercent(book, location);
            return <article className="ql-book" key={book.id}><div className="ql-cover-stage"><Link className="ql-cover" to={`/reader/${book.id}`} aria-label={`阅读 ${book.title}`}><img src={coverFor(book)} alt={`${book.title} 封面`} /><span className="ql-cover-action"><BookOpen size={20} strokeWidth={1.4} /><span>{location ? '继续阅读' : '翻开这本书'}</span></span></Link><Button className="ql-delete" variant="ghost" size="icon-sm" aria-label={`删除 ${book.title}`} onClick={() => setDeleting(book)}><Trash2 size={14} /></Button></div><Link className="ql-book-title" to={`/reader/${book.id}`}><h3 lang="en">{book.title}</h3></Link><p className="ql-book-author" lang="en">{book.author}</p><div className={`ql-book-status ${location ? 'is-reading' : ''}`}><span className="ql-status-dot" />{location ? `阅读中 · ${progress}%` : '未开始'}{book.imported && <span className="ql-imported-note">模拟导入</span>}</div>{location && <progress className="ql-book-progress" max="100" value={progress} aria-label={`${book.title} 阅读进度`} />}</article>;
          })}</div> : <div className="ql-empty"><BookOpen size={36} strokeWidth={1.1} /><h3>{query ? '没有找到这本书' : '你的书架，始于一本好书'}</h3><p>{query ? '试试其他书名，或搜索作者的名字。' : '导入一本 EPUB，把阅读的时间留给自己。'}</p><Button variant="outline" onClick={() => query ? setQuery('') : setImportOpen(true)}>{query ? '清除搜索' : '导入 EPUB'}</Button></div>}
      </section>
    </main>
    <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    <ConfirmDialog open={!!deleting} title={`删除《${deleting?.title}》？`} description="将移除书架中的书籍和阅读进度，已收藏的单词与原文句子会继续保留。" onClose={() => setDeleting(null)} onConfirm={() => {
      if (!deleting) return;
      setState(current => {
        const progress = {
          ...current.progress
        };
        delete progress[deleting.id];
        return {
          ...current,
          removedBooks: [...current.removedBooks, deleting.id],
          progress
        };
      });
      setDeleting(null);
      toast.success('已删除书籍，收藏资料已保留');
    }} />
  </div>;
}
function ImportDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
      setState
    } = useStore(),
    [status, setStatus] = useState('idle'),
    [message, setMessage] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  async function importFile(file?: File) {
    if (!file) return;
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setStatus('loading');
    setMessage(file.name);
    try {
      const book = await mockService.importBook(file, books[0], abort.signal);
      setState(s => ({
        ...s,
        importedBooks: [...s.importedBooks, book]
      }));
      setStatus('success');
      setMessage('模拟导入完成，正文使用内置样书。');
      toast.success('已加入书架');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setStatus('error');
        setMessage((error as Error).message);
      }
    }
  }
  function close() {
    abortRef.current?.abort();
    setStatus('idle');
    setMessage('');
    onClose();
  }
  return <Dialog open={open} onOpenChange={v => !v && close()}><DialogContent className="readict-dialog"><DialogHeader><DialogTitle>导入一本书</DialogTitle><DialogDescription>当前为模拟导入，不解析或上传文件。成功后使用内置样书正文演示阅读。</DialogDescription></DialogHeader><label className={`import-drop ${status === 'loading' ? 'busy' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => {
        e.preventDefault();
        if (status !== 'loading') void importFile(e.dataTransfer.files[0]);
      }}><FileUp size={30} strokeWidth={1.2} /><span>选择文件，或将 EPUB 拖到这里</span><small>.epub 格式 · 最大 50 MB</small><input aria-label="选择 EPUB 文件" type="file" accept=".epub" disabled={status === 'loading'} onChange={e => {
          void importFile(e.target.files?.[0]);
          e.target.value = '';
        }} /></label>{message && <p className={`import-status ${status === 'error' ? 'error' : ''}`} role="status">{status === 'loading' && <Loader2 className="spin" size={15} />}{status === 'loading' ? `正在模拟解析 ${message}…` : message}</p>}<p className="muted text-xs">文件名包含 fail 或 drm 时可体验导入失败状态。</p>{status === 'success' && <Button onClick={close}>返回书架</Button>}</DialogContent></Dialog>;
}
