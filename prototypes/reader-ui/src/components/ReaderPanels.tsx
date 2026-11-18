import type { Book, ReaderPreferences } from '@/lib/types'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CloseButton } from './common'
import { useStore } from '@/lib/store'

export function ContentsPanel({ book, current, onChoose, onClose }: { book: Book; current: number; onChoose: (index: number) => void; onClose: () => void }) {
  return <aside className="reader-panel" role="dialog" aria-label="章节目录"><div className="panel-heading"><h2>章节目录</h2><CloseButton onClick={onClose} /></div><p className="panel-book-name">{book.title}</p><nav className="chapter-list">{book.chapters.map((chapter, i) => <button key={chapter.id} aria-current={i === current ? 'location' : undefined} className={i === current ? 'current' : ''} onClick={() => onChoose(i)}><span className="chapter-index">{String(i + 1).padStart(2, '0')}</span><span>{chapter.title}</span>{i === current && <Check size={16} />}</button>)}</nav><p className="panel-note">共 {book.chapters.length} 章 · 内置样书节选</p></aside>
}
export function ReadingSettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, setState } = useStore()
  const prefs = state.preferences
  const change = (patch: Partial<ReaderPreferences>) => setState(s => ({ ...s, preferences: { ...s.preferences, ...patch } }))
  return <aside className="reader-panel settings-panel" role="dialog" aria-label="阅读设置"><div className="panel-heading"><h2>阅读设置</h2><CloseButton onClick={onClose} /></div>
    <fieldset><legend>字体</legend><div className="setting-options">{(['Georgia', 'Palatino Linotype', 'Arial'] as const).map((font, i) => <Button key={font} variant={prefs.font === font ? 'default' : 'outline'} style={{ fontFamily: font }} onClick={() => change({ font })}>{['Georgia', 'Palatino', 'Arial'][i]}</Button>)}</div></fieldset>
    <fieldset><legend>字号</legend><div className="setting-options">{[18, 20, 22, 24].map((fontSize, i) => <Button key={fontSize} aria-label={`字号 ${fontSize}`} variant={prefs.fontSize === fontSize ? 'default' : 'outline'} onClick={() => change({ fontSize })}>{['小', '中', '大', '特大'][i]}</Button>)}</div></fieldset>
    <fieldset><legend>行间距</legend><div className="setting-options">{[1.6, 1.8, 2].map((lineHeight, i) => <Button key={lineHeight} variant={prefs.lineHeight === lineHeight ? 'default' : 'outline'} onClick={() => change({ lineHeight })}>{['紧凑', '标准', '宽松'][i]}</Button>)}</div></fieldset>
    <fieldset><legend>正文宽度</legend><div className="setting-options">{[660, 720].map(width => <Button key={width} variant={prefs.width === width ? 'default' : 'outline'} onClick={() => change({ width })}>{width === 660 ? '标准宽度' : '宽松宽度'}</Button>)}</div></fieldset>
    <fieldset><legend>背景</legend><div className="setting-options">{(['white', 'warm', 'dark'] as const).map((theme, i) => <button key={theme} aria-pressed={prefs.theme === theme} className={`theme-choice theme-${theme}`} onClick={() => change({ theme })}><span>{['白色', '暖色', '深色'][i]}</span>{prefs.theme === theme && <Check size={14} />}</button>)}</div></fieldset>
    <p className="panel-note">偏好自动保存在此浏览器中，适用于所有书籍。</p>
  </aside>
}
