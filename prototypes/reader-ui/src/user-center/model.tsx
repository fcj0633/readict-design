/* eslint-disable react/only-export-components -- Isolated prototype context and its consumer share one entry. */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
export type Preferences = {
  font: 'Georgia' | 'Palatino Linotype' | 'Arial';
  fontSize: 18 | 20 | 22 | 24;
  lineHeight: 1.6 | 1.8 | 2;
  width: 660 | 720;
  theme: 'white' | 'warm' | 'dark';
  pronunciation: 'en-GB' | 'en-US';
};
export type SavePhase = 'loading' | 'saved' | 'saving' | 'error' | 'conflict';
export const defaults: Preferences = {
  font: 'Georgia',
  fontSize: 20,
  lineHeight: 1.8,
  width: 660,
  theme: 'warm',
  pronunciation: 'en-GB'
};
export const storageKey = 'readict-user-center-prototype-v1';
function load() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const p = value?.preferences;
    if (!p || !['Georgia', 'Palatino Linotype', 'Arial'].includes(p.font) || ![18, 20, 22, 24].includes(p.fontSize) || ![1.6, 1.8, 2].includes(p.lineHeight) || ![660, 720].includes(p.width) || !['white', 'warm', 'dark'].includes(p.theme) || !['en-GB', 'en-US'].includes(p.pronunciation)) return {
      nickname: 'Reader',
      preferences: defaults
    };
    return {
      nickname: typeof value.nickname === 'string' && value.nickname.trim() ? value.nickname.slice(0, 32) : 'Reader',
      preferences: p as Preferences
    };
  } catch {
    return {
      nickname: 'Reader',
      preferences: defaults
    };
  }
}
export function passwordValid(value: string) {
  return Array.from(value).length >= 8 && Array.from(value).length <= 128 && new TextEncoder().encode(value).length <= 512 && /[0-9]/.test(value) && /[A-Za-z]/.test(value);
}
type Demo = {
  nickname: string;
  rename: (name: string) => boolean;
  authenticated: boolean;
  login: () => void;
  endSession: () => void;
  logout: () => Promise<boolean>;
  logoutError: string;
  logoutFail: boolean;
  setLogoutFail: (value: boolean) => void;
  identity: 'email' | 'phone' | 'both';
  setIdentity: (value: 'email' | 'phone' | 'both') => void;
  emailVerified: boolean;
  setEmailVerified: (value: boolean) => void;
  phoneVerified: boolean;
  setPhoneVerified: (value: boolean) => void;
  draft: Preferences;
  stored: Preferences;
  phase: SavePhase;
  edit: (patch: Partial<Preferences>) => void;
  retry: () => void;
  resolve: (keep: boolean) => void;
  scenario: 'normal' | 'error' | 'conflict';
  setScenario: (value: 'normal' | 'error' | 'conflict') => void;
  storageError: string;
};
const Context = createContext<Demo | null>(null);
export function DemoProvider({
  children
}: {
  children: ReactNode;
}) {
  const [initial] = useState(load),
    [nickname, setNickname] = useState(initial.nickname);
  const [authenticated, setAuthenticated] = useState(true),
    [logoutFail, setLogoutFail] = useState(false),
    [logoutError, setLogoutError] = useState('');
  const [identity, setIdentity] = useState<'email' | 'phone' | 'both'>('email'),
    [emailVerified, setEmailVerified] = useState(false),
    [phoneVerified, setPhoneVerified] = useState(false);
  const [draft, setDraft] = useState<Preferences>(initial.preferences),
    [stored, setStored] = useState<Preferences>(initial.preferences),
    [phase, setPhase] = useState<SavePhase>('loading');
  const [scenario, setScenario] = useState<'normal' | 'error' | 'conflict'>('normal'),
    [storageError, setStorageError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    generation = useRef(0),
    pendingDraft = useRef(draft);
  const committed = useRef(stored),
    name = useRef(nickname),
    nextScenario = useRef(scenario),
    server = useRef<Preferences>(stored);
  function chooseScenario(value: 'normal' | 'error' | 'conflict') {
    nextScenario.current = value;
    setScenario(value);
  }
  function persist(p: Preferences, n = name.current) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        nickname: n,
        preferences: p
      }));
      setStorageError('');
      return true;
    } catch {
      setStorageError('浏览器无法保存演示记录。当前修改仍保留在本次会话中。');
      return false;
    }
  }
  useEffect(() => {
    const id = setTimeout(() => setPhase('saved'), 350);
    return () => {
      clearTimeout(id);
      // These refs intentionally hold the latest active timer and generation, not DOM nodes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(timer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Invalidate the latest in-flight mock save on unmount.
      generation.current++;
    };
  }, []);
  function schedule(p: Preferences, immediate = false) {
    clearTimeout(timer.current);
    const id = ++generation.current;
    pendingDraft.current = p;
    setPhase('saving');
    timer.current = setTimeout(() => {
      timer.current = setTimeout(() => {
        if (id !== generation.current) return;
        const result = nextScenario.current;
        setScenario('normal');
        nextScenario.current = 'normal';
        if (result === 'error') {
          setPhase('error');
          return;
        }
        if (result === 'conflict') {
          server.current = {
            ...committed.current,
            fontSize: committed.current.fontSize === 22 ? 20 : 22
          };
          setPhase('conflict');
          return;
        }
        if (!persist(p)) {
          setPhase('error');
          return;
        }
        committed.current = p;
        setStored(p);
        setPhase('saved');
      }, 650);
    }, immediate ? 0 : 500);
  }
  function edit(patch: Partial<Preferences>) {
    const p = {
      ...pendingDraft.current,
      ...patch
    };
    pendingDraft.current = p;
    setDraft(p);
    if (phase !== 'conflict') schedule(p);
  }
  function resolve(keep: boolean) {
    if (keep) {
      schedule(pendingDraft.current, true);
      return;
    }
    clearTimeout(timer.current);
    generation.current++;
    const value = server.current;
    pendingDraft.current = value;
    committed.current = value;
    setDraft(value);
    setStored(value);
    setPhase(persist(value) ? 'saved' : 'error');
  }
  function rename(value: string) {
    const n = value.trim().slice(0, 32);
    if (!n) return false;
    name.current = n;
    setNickname(n);
    return persist(committed.current, n);
  }
  async function logout() {
    setLogoutError('');
    await new Promise(resolve => setTimeout(resolve, 450));
    if (logoutFail) {
      setLogoutError('退出未完成，演示会话仍然保留。请重试。');
      setLogoutFail(false);
      return false;
    }
    setAuthenticated(false);
    return true;
  }
  return <Context.Provider value={{
    nickname,
    rename,
    authenticated,
    login: () => setAuthenticated(true),
    endSession: () => setAuthenticated(false),
    logout,
    logoutError,
    logoutFail,
    setLogoutFail,
    identity,
    setIdentity,
    emailVerified,
    setEmailVerified,
    phoneVerified,
    setPhoneVerified,
    draft,
    stored,
    phase,
    edit,
    retry: () => schedule(pendingDraft.current, true),
    resolve,
    scenario,
    setScenario: chooseScenario,
    storageError
  }}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw Error('DemoProvider missing');
  return value;
}
