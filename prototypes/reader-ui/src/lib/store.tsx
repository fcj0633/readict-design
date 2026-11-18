import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { books, defaultPreferences } from '@/data/mock'
import type { StoredState } from './types'

const key = 'readict-prototype-v1'
const empty: StoredState = { preferences: defaultPreferences, progress: {}, favorites: [], translations: {}, removedBooks: [], importedBooks: [] }
function load(): { state: StoredState; warning: boolean } {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { state: empty, warning: false }
    const value = JSON.parse(raw)
    if (!value || !Array.isArray(value.favorites) || !Array.isArray(value.removedBooks) || !Array.isArray(value.importedBooks) || typeof value.progress !== 'object' || !value.progress || typeof value.translations !== 'object' || !value.translations) throw Error('Invalid data')
    if (value.favorites.some((f: { lemma?: string; contexts?: unknown[] }) => typeof f.lemma !== 'string' || !Array.isArray(f.contexts))) throw Error('Invalid favorites')
    const p = value.preferences ?? {}
    value.preferences = { font: ['Georgia', 'Palatino Linotype', 'Arial'].includes(p.font) ? p.font : 'Georgia', fontSize: [18, 20, 22, 24].includes(p.fontSize) ? p.fontSize : 20, lineHeight: [1.6, 1.8, 2].includes(p.lineHeight) ? p.lineHeight : 1.8, width: [660, 720].includes(p.width) ? p.width : 660, theme: ['warm', 'white', 'dark'].includes(p.theme) ? p.theme : 'warm' }
    return { state: value, warning: false }
  } catch { return { state: empty, warning: true } }
}
type Store = { state: StoredState; setState: React.Dispatch<React.SetStateAction<StoredState>>; allBooks: typeof books }
const Context = createContext<Store | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load)
  const [state, setState] = useState(initial.state)
  const warned = useRef(false)
  useEffect(() => {
    if (initial.warning && !warned.current) { toast.warning('本地记录无法读取，已恢复默认设置'); warned.current = true }
  }, [initial.warning])
  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme
    document.documentElement.classList.toggle('dark', state.preferences.theme === 'dark')
    try { localStorage.setItem(key, JSON.stringify(state)) }
    catch { if (!warned.current) { toast.warning('无法保存到本地，本次更改仅在当前会话保留'); warned.current = true } }
  }, [state])
  const allBooks = [...books, ...state.importedBooks].filter(book => !state.removedBooks.includes(book.id))
  return <Context.Provider value={{ state, setState, allBooks }}>{children}</Context.Provider>
}
export function useStore() { const value = useContext(Context); if (!value) throw Error('Missing StoreProvider'); return value }
