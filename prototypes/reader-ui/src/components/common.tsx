import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { WordContext } from '@/lib/types'

export function Header({ title, back, children }: { title?: string; back?: string; children?: ReactNode }) {
  return <header className="app-header"><Link to="/books" className="wordmark">Readict<span className="brand-dot">.</span></Link>{back && <Link to={back} className="back-link"><ArrowLeft size={17} />{back === '/books' ? '返回书架' : '继续阅读'}</Link>}{title && <span className="header-title">{title}</span>}<div className="header-actions">{children}</div></header>
}
export function IconButton({ label, children, onClick, active = false }: { label: string; children: ReactNode; onClick: () => void; active?: boolean }) {
  return <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} aria-pressed={active} className={`icon-button ${active ? 'is-active' : ''}`} onClick={onClick} />}>{children}</TooltipTrigger><TooltipContent side="left">{label}</TooltipContent></Tooltip>
}
export function CloseButton({ onClick }: { onClick: () => void }) { return <Button aria-label="关闭" variant="ghost" size="icon-sm" onClick={onClick}><X size={17} /></Button> }
export function ContextSentence({ context }: { context: WordContext }) { return <p className="context-sentence" lang="en">{context.sentence.slice(0, context.start)}<mark>{context.sentence.slice(context.start, context.end)}</mark>{context.sentence.slice(context.end)}</p> }
export function ConfirmDialog({ open, title, description, onClose, onConfirm }: { open: boolean; title: string; description: string; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} onOpenChange={v => !v && onClose()}><DialogContent className="readict-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={onClose}>保留</Button><Button variant="destructive" onClick={onConfirm}>确认删除</Button></DialogFooter></DialogContent></Dialog>
}
