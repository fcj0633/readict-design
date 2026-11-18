import { useEffect, useRef, useState } from 'react'
import { FloatingArrow, FloatingFocusManager, FloatingPortal, arrow, autoUpdate, flip, offset, shift, size, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import { Star as Bookmark, Check, ChevronDown, Loader2, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { CloseButton, ConfirmDialog, ContextSentence } from './common'
import { useStore } from '@/lib/store'
import { mergeFavorite, mockService } from '@/lib/services'
import { normalize } from '@/data/mock'
import type { DictionaryEntry, Selection } from '@/lib/types'

function fitPopover({ availableHeight, elements }: { availableHeight: number; elements: { floating: HTMLElement } }) {
  elements.floating.style.maxHeight = `${Math.max(100, Math.min(window.innerHeight * .75, availableHeight))}px`
}

export function DictionaryPopover({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const { state, setState } = useStore()
  const [entry, setEntry] = useState<DictionaryEntry | null>(null)
  const [status, setStatus] = useState('loading')
  const [retry, setRetry] = useState(0)
  const [senseIndex, setSenseIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [translationState, setTranslationState] = useState('idle')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const returnRef = useRef(selection.element)
  const arrowRef = useRef<SVGSVGElement | null>(null)
  const controller = useRef<AbortController | null>(null)
  const saveController = useRef<AbortController | null>(null)
  const { context, refs, floatingStyles } = useFloating({
    open: true, onOpenChange: open => { if (!open && !confirm) onClose() }, placement: 'right-start',
    elements: { reference: selection.element }, whileElementsMounted: autoUpdate,
    // Floating UI reads the arrow ref during its positioning lifecycle.
    // oxlint-disable-next-line react/refs
    middleware: [offset(14), flip({ fallbackPlacements: ['left-start', 'bottom-start', 'top-start'], padding: 16 }), shift({ padding: 16 }), size({ padding: 16, apply: fitPopover }), arrow({ element: arrowRef })],
  })
  const dismiss = useDismiss(context, { enabled: !confirm, outsidePress: event => !(event.target instanceof Element && event.target.closest('[data-word]')) })
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])
  useEffect(() => {
    const abort = new AbortController()
    mockService.lookup(selection.word, abort.signal).then(value => { setEntry(value); setStatus(value ? 'success' : 'empty') }).catch(error => { if (error.name !== 'AbortError') setStatus('error') })
    return () => { abort.abort(); controller.current?.abort(); saveController.current?.abort() }
  }, [selection.word, retry])
  const translation = state.translations[selection.context.id]
  const favorite = state.favorites.find(item => item.lemma === normalize(selection.word))
  const savedContext = favorite?.contexts.some(item => item.id === selection.context.id)
  const visibleSenses = entry?.senses.slice(0, 3) ?? []
  const more = entry?.senses.slice(3) ?? []
  async function translate() {
    controller.current?.abort()
    const abort = new AbortController(); controller.current = abort
    setTranslationState('loading')
    try {
      const value = await mockService.translate(selection.context, abort.signal)
      setState(s => ({ ...s, translations: { ...s.translations, [selection.context.id]: value }, favorites: s.favorites.map(f => ({ ...f, contexts: f.contexts.map(c => c.id === selection.context.id ? { ...c, translation: value } : c) })) }))
      setTranslationState('success')
    } catch (error) { if ((error as Error).name !== 'AbortError') setTranslationState('error') }
  }
  async function save() {
    if (!entry || saving) return
    if (savedContext) { setConfirm(true); return }
    const abort = new AbortController(); saveController.current = abort; setSaving(true)
    try {
      await mockService.save(entry.lemma, abort.signal)
      setState(s => ({ ...s, favorites: mergeFavorite(s.favorites, entry, entry.senses[senseIndex], { ...selection.context, translation: s.translations[selection.context.id] }) }))
      toast.success(favorite ? '已收藏本句' : '已收藏单词和原文句子')
    } catch (error) { if ((error as Error).name !== 'AbortError') toast.error((error as Error).message) }
    finally { if (!abort.signal.aborted) setSaving(false) }
  }
  function speak() {
    if (!('speechSynthesis' in window)) { toast.info('当前浏览器不支持语音朗读'); return }
    const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
    if (!voices.length) { toast.info('当前设备没有可用的英语语音'); return }
    const utterance = new SpeechSynthesisUtterance(entry?.lemma ?? selection.word)
    utterance.voice = voices.find(v => v.lang === 'en-GB') ?? voices[0]; utterance.rate = .85
    utterance.onerror = () => toast.error('语音暂时不可用')
    speechSynthesis.cancel(); speechSynthesis.speak(utterance)
  }
  return <><FloatingPortal><FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={returnRef}>
    <section ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="dictionary-popover" aria-label={`查询 ${selection.word}`} data-testid="dictionary-popover">
      <FloatingArrow ref={arrowRef} context={context} fill="var(--paper)" stroke="var(--line)" strokeWidth={1} />
      <div className="dictionary-scroll"><div className="popover-heading"><span>查询</span><CloseButton onClick={onClose} /></div>
      <div className="entry-section" aria-live="polite">
        {status === 'loading' && <div aria-label="词典加载中" className="dictionary-loading"><Skeleton className="h-7 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-full" /></div>}
        {status === 'error' && <div className="inline-error"><strong>{selection.word}</strong><p>词典查询超时，原文仍可查看。</p><Button size="sm" variant="outline" onClick={() => { setStatus('loading'); setRetry(v => v + 1) }}>重试查询</Button></div>}
        {status === 'empty' && <div className="inline-error"><h2>{selection.word}</h2><p>示例词典暂未收录这个单词。</p><span className="muted">可以查看原文，或试试 acknowledged、fortune、run。</span></div>}
        {status === 'success' && entry && <><div className="entry-title"><h2>{entry.lemma}</h2><Button variant="ghost" size="icon-sm" aria-label="播放发音" onClick={speak}><Volume2 size={18} /></Button></div><div className="entry-meta"><span>原文词形：<i lang="en">{selection.word}</i></span><span>{entry.ipa}</span></div>
        <div className="senses">{visibleSenses.map((sense, i) => <button key={i} onClick={() => setSenseIndex(i)} aria-pressed={senseIndex === i} className={`sense ${senseIndex === i ? 'selected' : ''}`}><span>{sense.pos}</span><span>{sense.meaning}</span>{senseIndex === i && <Check size={13} />}</button>)}</div>
        {more.length > 0 && <Collapsible open={expanded} onOpenChange={setExpanded}><CollapsibleTrigger className="more-senses">{expanded ? '收起更多释义' : `更多释义（${more.length}）`}<ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></CollapsibleTrigger><CollapsibleContent><div className="senses extra-senses">{more.map((sense, i) => <button key={i} className={`sense ${senseIndex === i + 3 ? 'selected' : ''}`} aria-pressed={senseIndex === i + 3} onClick={() => setSenseIndex(i + 3)}><span>{sense.pos}</span><span>{sense.meaning}</span>{senseIndex === i + 3 && <Check size={13} />}</button>)}</div></CollapsibleContent></Collapsible>}
        <p className="data-source">{entry.source}{['run', 'acknowledge'].includes(entry.lemma) ? ' · 按示例句词性排序' : ' · 按默认词义顺序'}</p></>}
      </div>
      <div className="context-section"><span className="section-caption">原文语境</span><ContextSentence context={selection.context} /><p className="context-source">{selection.context.bookTitle} · {selection.context.chapterTitle}</p>
        {translation && <div className="translation-result" lang="zh"><p>{translation}</p><span>示例翻译</span></div>}
        {translationState === 'loading' && <p className="translation-status" role="status"><Loader2 className="spin" size={14} />正在翻译例句…</p>}
        {translationState === 'error' && <p className="translation-status error" role="alert">翻译暂时不可用，请重试。</p>}
      </div></div>
      <div className="dictionary-actions"><Button onClick={save} disabled={!entry || saving}>{saving ? <Loader2 size={16} className="spin" /> : savedContext ? <Check size={16} /> : <Bookmark size={16} />}{saving ? '保存中' : savedContext ? '已收藏' : favorite ? '收藏本句' : '收藏'}</Button><Button variant="outline" onClick={translate} disabled={translationState === 'loading' || !!translation}>{translation ? '已翻译' : translationState === 'error' ? '重试翻译' : '翻译例句'}</Button></div>
    </section>
  </FloatingFocusManager></FloatingPortal><ConfirmDialog open={confirm} title={`取消收藏 ${entry?.lemma}？`} description={`将移除这个单词和全部 ${favorite?.contexts.length ?? 0} 条关联原文句子。`} onClose={() => setConfirm(false)} onConfirm={() => { setState(s => ({ ...s, favorites: s.favorites.filter(f => f.lemma !== entry?.lemma) })); setConfirm(false); toast.success('已取消收藏') }} /></>
}
