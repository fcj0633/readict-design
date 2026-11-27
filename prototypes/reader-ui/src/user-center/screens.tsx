import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode, RefObject } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Eye, EyeOff, Headphones, LogOut, Mail, Settings2, ShieldCheck, Smartphone, UserRound, FlaskConical, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { passwordValid, useDemo } from './model';
const base = '/user-center';
function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
  type = 'button'
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return <button type={type} className={`uc-button ${secondary ? 'secondary' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
function Avatar({
  large = false
}: {
  large?: boolean;
}) {
  return <span className={`uc-avatar ${large ? 'large' : ''}`}><UserRound strokeWidth={1.3} /></span>;
}
function Header() {
  const d = useDemo(),
    navigate = useNavigate(),
    location = useLocation(),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    menu = useRef<HTMLDivElement>(null);
  const auth = /\/(login|register|forgot-password|reset-password)$/.test(location.pathname);
  function close(focus = false) {
    setOpen(false);
    if (focus) trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    function outside(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    ;
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  async function logout() {
    setBusy(true);
    const ok = await d.logout();
    setBusy(false);
    if (ok) {
      close();
      navigate(`${base}/login`);
    }
  }
  return <header className="uc-header"><div className="uc-header-inner"><Link className="uc-logo" to={`${base}/books`}>Readict<span>.</span></Link>{!auth && <nav className="uc-main-nav" aria-label="主导航"><NavLink to={`${base}/books`}>书架</NavLink><NavLink to={`${base}/favorites`}>收藏</NavLink></nav>}<span className="uc-prototype-label">用户中心 · 交互原型</span>{!auth && d.authenticated && <div className="uc-menu-root" ref={root} onBlur={e => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}><button ref={trigger} className="uc-avatar-trigger" aria-label="打开账户菜单" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)} onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}><Avatar /><ChevronDown size={14} /></button>{open && <div className="uc-menu" ref={menu} role="menu" aria-label="账户菜单" onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            close(true);
          }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
            const items = Array.from(menu.current!.querySelectorAll<HTMLElement>('[role=menuitem]'));
            const i = items.indexOf(document.activeElement as HTMLElement);
            items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
          }
        }}><div className="uc-menu-identity"><strong>{d.nickname}</strong><span>{d.identity === 'phone' ? '+86 138 **** 0000' : 'reader@example.com'}</span><small>示例身份 · 不连接真实账号</small></div><Link role="menuitem" to={`${base}/account`} onClick={() => close()}><UserRound />个人账户<ArrowRight /></Link><Link role="menuitem" to={`${base}/settings/reading`} onClick={() => close()}><Settings2 />个性化设置<ArrowRight /></Link><div className="uc-menu-separator" /><button role="menuitem" disabled={busy} onClick={logout}><LogOut />{busy ? '正在退出…' : '退出登录'}</button>{d.logoutError && <p className="uc-menu-error" role="alert">{d.logoutError}</p>}</div>}</div>}{!auth && !d.authenticated && <Link to={`${base}/login`} className="uc-text-link">演示登录</Link>}</div></header>;
}
function PageTitle({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return <div className="uc-page-title"><div><span className="uc-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  returnFocus
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="uc-dialog" finalFocus={returnFocus}><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{children}</DialogContent></Dialog>;
}
function PasswordField({
  label,
  value,
  onChange,
  autoComplete = 'new-password'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return <label className="uc-field">{label}<span className="uc-password"><input type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={e => onChange(e.target.value)} required /><button type="button" aria-label={`${show ? '隐藏' : '显示'}${label}`} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>;
}
function Account() {
  const returnFocus = useRef<HTMLElement | null>(null);
  const d = useDemo(),
    navigate = useNavigate(),
    [dialog, setDialog] = useState(''),
    [name, setName] = useState(d.nickname),
    [current, setCurrent] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  function open(value: string) {
    returnFocus.current = document.activeElement as HTMLElement;
    setError('');
    setName(d.nickname);
    setCurrent('');
    setPassword('');
    setConfirm('');
    setDialog(value);
  }
  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (!passwordValid(password)) {
      setError('新密码需为 8–128 个字符，包含英文字母和数字，且不超过 512 字节。');
      return;
    }
    if (password !== confirm) {
      setError('两次输入的新密码不一致。');
      return;
    }
    setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    setBusy(false);
    setCurrent('');
    setPassword('');
    setConfirm('');
    d.endSession();
    navigate(`${base}/login`, {
      state: {
        notice: '修改密码演示已完成，请重新登录。真实密码没有被修改。'
      }
    });
  }
  return <main className="uc-account"><PageTitle eyebrow="YOUR ACCOUNT" title="个人账户" description="在这里，照顾好你的阅读身份。" /><section className="uc-identity"><Avatar large /><div><div className="uc-name">{d.nickname}<span className="uc-tag">示例身份</span></div><p>属于你的书架，属于你的阅读时光。</p></div><Button secondary onClick={() => open('profile')}>编辑资料</Button></section><div className="uc-section-heading"><h2>账户与安全</h2><span>联系方式与登录凭据</span></div><section className="uc-account-list"><Contact icon={<Mail />} title="邮箱" bound={d.identity !== 'phone'} verified={d.emailVerified} value="reader@example.com" onExplain={() => open('verification')} /><Contact icon={<Smartphone />} title="手机号" bound={d.identity !== 'email'} verified={d.phoneVerified} value="+86 138 **** 0000" onExplain={() => open('verification')} /><div className="uc-account-row"><span className="uc-row-icon"><ShieldCheck /></span><div><h3>登录密码</h3><p>定期更新密码，保护阅读记录与收藏。</p></div><Button secondary onClick={() => open('password')}>修改密码</Button></div></section><div className="uc-account-note"><ShieldCheck size={18} /><p>此页面使用示例身份。真实验证服务暂不可用，联系方式格式正确也不代表已完成所有权验证。</p></div><Link className="uc-preference-link" to={`${base}/settings/reading`}><span><Settings2 size={20} /><strong>让阅读更合你的习惯</strong><small>字体、纸面与发音偏好</small></span><ArrowRight size={20} /></Link>
  <Modal returnFocus={returnFocus} open={dialog === 'profile'} onOpenChange={v => {
      if (!v) setDialog('');
    }} title="编辑资料" description="调整此原型中显示的阅读身份。"><form onSubmit={e => {
        e.preventDefault();
        if (d.rename(name)) setDialog('');else setError('昵称不能为空，或浏览器无法保存演示记录。');
      }}><div className="uc-profile-avatar"><Avatar large /><span>默认头像</span></div><label className="uc-field">昵称<input value={name} onChange={e => setName(e.target.value)} maxLength={32} required autoFocus /></label><p className="uc-hint">昵称为待确认的新增设计，仅在此原型生效。<br />不修改正式账户资料。</p>{error && <p role="alert" className="uc-error">{error}</p>}<div className="uc-dialog-actions"><Button secondary onClick={() => setDialog('')}>取消</Button><Button type="submit">保存昵称</Button></div></form></Modal>
  <Modal returnFocus={returnFocus} open={dialog === 'password'} onOpenChange={v => {
      if (!busy && !v) setDialog('');
    }} title="修改密码" description="这是交互演示，不会读取或修改真实密码。"><form onSubmit={changePassword}><PasswordField label="当前密码" value={current} onChange={setCurrent} autoComplete="current-password" /><PasswordField label="新密码" value={password} onChange={setPassword} /><p className="uc-hint">8–128 个字符，包含英文字母与数字；最多 512 字节。</p><PasswordField label="确认新密码" value={confirm} onChange={setConfirm} />{error && <p role="alert" className="uc-error">{error}</p>}<p className="uc-hint">演示成功后将返回登录页。密码不会被保存。</p><div className="uc-dialog-actions"><Button secondary disabled={busy} onClick={() => setDialog('')}>取消</Button><Button type="submit" disabled={busy}>{busy ? '正在演示…' : '确认修改（演示）'}</Button></div></form></Modal>
  <Modal returnFocus={returnFocus} open={dialog === 'verification'} onOpenChange={v => {
      if (!v) setDialog('');
    }} title="关于联系方式验证" description="真实验证服务暂不可用。"><p className="uc-modal-copy">本原型不会发送邮件或短信，也不会把格式有效的联系方式标记为已验证。评审工具中的“已验证”仅用于展示该状态的界面。</p><Button onClick={() => setDialog('')}>知道了</Button></Modal></main>;
}
function Contact({
  icon,
  title,
  bound,
  verified,
  value,
  onExplain
}: {
  icon: ReactNode;
  title: string;
  bound: boolean;
  verified: boolean;
  value: string;
  onExplain: () => void;
}) {
  return <div className="uc-account-row"><span className="uc-row-icon">{icon}</span><div><h3>{title}<span className={`uc-status ${bound && verified ? 'verified' : ''}`}>{bound ? verified ? '已验证 · 演示' : '未验证' : '未绑定'}</span></h3><p className={bound ? 'uc-contact-value' : ''}>{bound ? value : '尚未添加' + title}</p></div><button className="uc-text-link" onClick={onExplain}>验证说明 <ArrowRight size={15} /></button></div>;
}
function SaveStatus() {
  const d = useDemo();
  return <span className={`uc-save-status ${d.phase}`} role="status">{d.phase === 'saved' ? <Check size={16} /> : d.phase === 'error' || d.phase === 'conflict' ? <AlertCircle size={16} /> : <span className="uc-status-dot" />}{{
      loading: '读取演示偏好…',
      saved: '已保存在此浏览器 · 演示',
      saving: '正在保存 · 演示',
      error: '保存未完成',
      conflict: '有待处理的版本冲突'
    }[d.phase]}</span>;
}
function Settings() {
  const d = useDemo();
  return <main className="uc-settings"><PageTitle eyebrow="MAKE ROOM FOR READING" title="个性化设置" description="把每一页，调成你喜欢的样子。"><SaveStatus /></PageTitle><div className="uc-settings-layout"><aside className="uc-settings-nav" aria-label="设置分类"><NavLink to={`${base}/settings/reading`}><BookOpen size={18} />阅读设置</NavLink><NavLink to={`${base}/settings/pronunciation`}><Headphones size={18} />词典与发音</NavLink><Link className="uc-back-account" to={`${base}/account`}><ArrowLeft size={14} />个人账户</Link></aside><div className="uc-settings-content">{d.phase === 'error' && <div className="uc-save-banner" role="alert"><div><strong>设置还没有保存成功</strong><p>演示同步失败；当前修改已保留，可以重试。</p></div><Button secondary onClick={d.retry}>重新保存</Button></div>}{d.phase === 'conflict' && <div className="uc-save-banner conflict" role="alert"><div><strong>另一处演示设置已更新</strong><p>当前草稿仍保留。请选择使用已保存版本，或重新保存你的修改。</p><div className="uc-conflict-actions"><Button secondary onClick={() => d.resolve(false)}>使用已保存设置</Button><Button onClick={() => d.resolve(true)}>保留当前修改并重新保存</Button></div></div></div>}<Routes><Route path="reading" element={<Reading />} /><Route path="pronunciation" element={<Pronunciation />} /><Route path="*" element={<Navigate to="reading" replace />} /></Routes></div></div></main>;
}
function Choices<T extends string | number>({
  label,
  values,
  value,
  onChange,
  format
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  const disabled = useDemo().phase === 'loading';
  return <div className="uc-control-group"><h3>{label}</h3><div className="uc-segments" role="group" aria-label={label}>{values.map(v => <button key={v} disabled={disabled} aria-pressed={v === value} onClick={() => onChange(v)}>{format ? format(v) : v}</button>)}</div></div>;
}
function Reading() {
  const d = useDemo(),
    p = d.draft;
  return <><div className="uc-content-heading"><h2>阅读设置</h2><p>好的排版，让注意力留在故事里。</p></div><div className="uc-reading-grid"><div className="uc-reading-controls"><div className="uc-control-group"><h3>正文字体</h3><div className="uc-fonts">{(['Georgia', 'Palatino Linotype', 'Arial'] as const).map(font => <button disabled={d.phase === 'loading'} key={font} aria-pressed={p.font === font} onClick={() => d.edit({
              font
            })} style={{
              fontFamily: font
            }}><span>Aa</span><small>{font === 'Palatino Linotype' ? 'Palatino' : font}</small>{p.font === font && <Check size={13} />}</button>)}</div></div><Choices label="字号" values={[18, 20, 22, 24] as const} value={p.fontSize} onChange={fontSize => d.edit({
          fontSize
        })} format={v => `${v} px`} /><Choices label="行距" values={[1.6, 1.8, 2] as const} value={p.lineHeight} onChange={lineHeight => d.edit({
          lineHeight
        })} format={v => `${v.toFixed(1)} 倍`} /><Choices label="正文宽度" values={[660, 720] as const} value={p.width} onChange={width => d.edit({
          width
        })} format={v => `${v} px`} /><div className="uc-control-group"><h3>阅读纸面</h3><div className="uc-paper-options">{(['white', 'warm', 'dark'] as const).map((theme, i) => <button disabled={d.phase === 'loading'} key={theme} aria-pressed={p.theme === theme} onClick={() => d.edit({
              theme
            })}><span data-reading-theme={theme}><i>The quiet<br />of a page.</i>{theme === p.theme && <Check size={13} />}</span><small>{['白色', '暖纸', '夜读'][i]}</small></button>)}</div></div></div><section className="uc-preview"><div className="uc-preview-label"><span>阅读预览</span><span>即时呈现你的偏好</span></div><div className="uc-paper" data-reading-theme={p.theme}><div className="uc-preview-text" style={{
            fontFamily: p.font,
            fontSize: p.fontSize,
            lineHeight: p.lineHeight,
            width: `${p.width / 720 * 100}%`
          }}><span className="uc-chapter-kicker">PRIDE AND PREJUDICE</span><h3>Chapter One</h3><p>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p><p>However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.</p></div><span className="uc-paper-page">1</span></div><p className="uc-preview-foot">Jane Austen · 阅读片段仅用于排版预览</p></section></div></>;
}
function Pronunciation() {
  const d = useDemo();
  return <div className="uc-pronunciation"><div className="uc-content-heading"><h2>词典与发音</h2><p>可靠的释义，熟悉的声音。</p></div><div className="uc-dictionary-source"><span className="uc-row-icon"><BookOpen /></span><div><h3>词典来源 <span className="uc-tag">只读</span></h3><strong>COL</strong><p>标准词典释义与发音，延续当前阅读器的数据来源。</p></div></div><div className="uc-control-group"><h3>优先发音口音</h3><p className="uc-section-copy">查词时，优先选择你更习惯的发音。</p><div className="uc-accent-options">{(['en-GB', 'en-US'] as const).map((accent, i) => <button key={accent} disabled={d.phase === 'loading'} aria-pressed={d.draft.pronunciation === accent} onClick={() => d.edit({
          pronunciation: accent
        })}><span className="uc-radio">{d.draft.pronunciation === accent && <span />}</span><span><strong>{i === 0 ? '英式发音' : '美式发音'}</strong><small>{i === 0 ? 'British English' : 'American English'}</small></span><span className="uc-accent-code">{i === 0 ? 'UK' : 'US'}</span></button>)}</div></div><div className="uc-audio-note"><Headphones size={20} /><div><strong>有录音时，让声音跟随你的偏好</strong><p>当前阅读器已接入 COL 音频。具体单词或口音仍可能缺少录音，此偏好不保证每次都能播放。本页只演示偏好保存，不请求或播放真实音频。</p></div></div></div>;
}
const library = [['pride', 'Pride and Prejudice', 'Jane Austen', '阅读中 · 32%'], ['garden', 'The Secret Garden', 'Frances Hodgson Burnett', '未开始'], ['gatsby', 'The Great Gatsby', 'F. Scott Fitzgerald', '未开始'], ['jane', 'Jane Eyre', 'Charlotte Brontë', '未开始'], ['moby', 'Moby-Dick', 'Herman Melville', '未开始'], ['little-women', 'Little Women', 'Louisa May Alcott', '未开始']];
function Books() {
  return <main className="uc-books"><PageTitle eyebrow="A QUIET PLACE FOR YOUR BOOKS" title="我的书架" description="用户中心导航预览 · 以下为示例藏书，不读取原有书架记录。" /><section className="uc-book-hero"><img src="/user-center/covers/pride.jpg" alt="Pride and Prejudice 封面" /><div><span className="uc-eyebrow">CONTINUE READING · 示例进度</span><h2>Pride and Prejudice</h2><p>Jane Austen</p><span>Chapter 12 · 32%</span></div><a className="uc-button" href="/index.html#/">查看已有阅读原型 <ArrowRight size={17} /></a></section><div className="uc-section-heading"><h2>我的藏书 <small>6 本示例</small></h2><span>仅用于头像导航展示</span></div><div className="uc-book-grid">{library.map(([id, title, author, status]) => <div key={id}><img src={`/user-center/covers/${id}.jpg`} alt={`${title} 封面`} /><h3>{title}</h3><p>{author}</p><small>{status}</small></div>)}</div></main>;
}
function Favorites() {
  return <main className="uc-account"><PageTitle eyebrow="WORDS WORTH KEEPING" title="我的收藏" description="原有收藏与阅读语境保留在已有原型中。" /><div className="uc-empty"><BookOpen size={34} /><h2>把遇见的单词，留在故事里</h2><p>本入口用于演示统一导航，不读取或改写已有收藏。</p><a className="uc-button" href="/index.html#/favorites">打开已有收藏原型 <ArrowRight size={16} /></a></div></main>;
}
function Auth({
  mode
}: {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password';
}) {
  const d = useDemo(),
    navigate = useNavigate(),
    location = useLocation(),
    [channel, setChannel] = useState<'email' | 'phone'>('email'),
    [contact, setContact] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const title = {
    login: '欢迎回来',
    register: '开始你的阅读时光',
    'forgot-password': '找回密码',
    'reset-password': '设置新密码'
  }[mode];
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (mode !== 'reset-password' && !(channel === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) : /^1[3-9]\d{9}$/.test(contact))) {
      setError(channel === 'email' ? '请输入有效的邮箱格式。' : '请输入 11 位中国大陆手机号。');
      return;
    }
    if (mode !== 'forgot-password' && !passwordValid(password)) {
      setError('密码需为 8–128 个字符，包含英文字母和数字，且不超过 512 字节。');
      return;
    }
    if ((mode === 'register' || mode === 'reset-password') && password !== confirm) {
      setError('两次输入的密码不一致。');
      return;
    }
    if (mode === 'forgot-password') {
      setError('真实邮件与短信通道暂不可用，未发送任何验证码或恢复链接。可从下方进入重置页面演示。');
      return;
    }
    setBusy(true);
    await new Promise(r => setTimeout(r, 550));
    setBusy(false);
    setPassword('');
    setConfirm('');
    if (mode === 'login') {
      d.login();
      navigate(`${base}/account`);
    } else {
      d.endSession();
      navigate(`${base}/login`, {
        state: {
          notice: mode === 'register' ? '注册流程演示完成，未创建真实账户，联系方式未验证。' : '重置流程演示完成，未修改任何真实密码。'
        }
      });
    }
  }
  return <main className="uc-auth"><div className="uc-auth-intro"><span className="uc-eyebrow">YOUR NEXT CHAPTER</span><h1>{title}</h1><p>一本书，一段安静的时间。</p></div><section className="uc-auth-paper"><div className="uc-auth-demo"><FlaskConical size={16} />认证流程原型 · 不连接真实账户</div>{location.state?.notice && <p className="uc-auth-notice" role="status">{location.state.notice}</p>}<form onSubmit={submit}>{mode !== 'reset-password' && <><div className="uc-auth-tabs" role="group" aria-label="登录方式">{(['email', 'phone'] as const).map(c => <button type="button" aria-pressed={channel === c} key={c} onClick={() => {
              setChannel(c);
              setContact('');
              setError('');
            }}>{c === 'email' ? '邮箱' : '手机号'}</button>)}</div><label className="uc-field">{channel === 'email' ? '邮箱地址' : '手机号码'}<span className="uc-contact-input">{channel === 'phone' && <span>+86</span>}<input type={channel === 'email' ? 'email' : 'tel'} autoComplete={channel === 'email' ? 'email' : 'tel-national'} placeholder={channel === 'email' ? 'reader@example.com' : '11 位中国大陆手机号'} value={contact} onChange={e => setContact(e.target.value)} required /></span></label></>}{mode !== 'forgot-password' && <><PasswordField label={mode === 'login' ? '密码' : '新密码'} value={password} onChange={setPassword} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><p className="uc-hint">8–128 个字符，包含英文字母与数字，最多 512 字节。</p></>}{(mode === 'register' || mode === 'reset-password') && <PasswordField label="确认密码" value={confirm} onChange={setConfirm} />}<p className="uc-error" role="alert">{error}</p>{mode === 'login' && <Link className="uc-forgot" to={`${base}/forgot-password`}>忘记密码？</Link>}<Button type="submit" disabled={busy}>{busy ? '正在演示…' : {
            login: '登录（演示）',
            register: '注册（演示）',
            'forgot-password': '查看恢复方式',
            'reset-password': '重置密码（演示）'
          }[mode]}<ArrowRight size={17} /></Button></form><p className="uc-auth-switch">{mode === 'login' ? <>还没有账户？ <Link to={`${base}/register`}>注册</Link></> : <Link to={`${base}/login`}>返回登录</Link>}</p>{mode === 'forgot-password' && <Link className="uc-reset-demo" to={`${base}/reset-password`}>仅预览重置表单（无真实恢复凭据）</Link>}</section><p className="uc-auth-footnote">请使用示例信息体验。密码与恢复凭据不会保存。</p></main>;
}
function DemoTools() {
  const d = useDemo();
  return <details className="uc-demo-tools"><summary><FlaskConical size={15} />原型演示状态<ChevronDown size={13} /></summary><div><strong>评审工具 · 非用户设置</strong><label>联系方式场景<select value={d.identity} onChange={e => d.setIdentity(e.target.value as typeof d.identity)}><option value="email">邮箱已绑定，手机未绑定</option><option value="phone">手机已绑定，邮箱未绑定</option><option value="both">邮箱与手机均已绑定</option></select></label><label className="uc-check"><input type="checkbox" checked={d.emailVerified} onChange={e => d.setEmailVerified(e.target.checked)} />邮箱已验证（仅演示）</label><label className="uc-check"><input type="checkbox" checked={d.phoneVerified} onChange={e => d.setPhoneVerified(e.target.checked)} />手机号已验证（仅演示）</label><label>下一次设置保存<select value={d.scenario} onChange={e => d.setScenario(e.target.value as typeof d.scenario)}><option value="normal">成功</option><option value="error">失败，可重试</option><option value="conflict">版本冲突，保留草稿</option></select></label><small>选择后修改任一阅读或发音偏好触发。</small><label className="uc-check"><input type="checkbox" checked={d.logoutFail} onChange={e => d.setLogoutFail(e.target.checked)} />下一次退出失败</label><Link to={`${base}/login`}>查看登录页面 <ArrowRight size={13} /></Link></div></details>;
}
export function UserCenter() {
  const d = useDemo(),
    location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Readict · 用户中心设计预览';
  }, [location.pathname]);
  return <div className="uc-app"><Header />{d.storageError && <p className="uc-storage-error" role="alert">{d.storageError}</p>}<Routes><Route path={`${base}/books`} element={<Books />} /><Route path={`${base}/favorites`} element={<Favorites />} /><Route path={`${base}/account`} element={d.authenticated ? <Account /> : <Navigate to={`${base}/login`} replace />} /><Route path={`${base}/settings/*`} element={d.authenticated ? <Settings /> : <Navigate to={`${base}/login`} replace />} />{(['login', 'register', 'forgot-password', 'reset-password'] as const).map(mode => <Route key={mode} path={`${base}/${mode}`} element={<Auth key={mode} mode={mode} />} />)}<Route path="*" element={<Navigate to={`${base}/account`} replace />} /></Routes><footer className="uc-footer"><span>Readict · Quiet Library</span><span>交互设计原型 · 身份与同步均为演示</span><a href="/index.html#/">返回已有原型 <ArrowRight size={13} /></a></footer><DemoTools /></div>;
}
