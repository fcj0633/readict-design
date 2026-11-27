import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { MemberHeader, DemoTools } from '../user-center/screens';
import { DemoProvider, useDemo } from '../user-center/model';
import type { Preferences } from '../user-center/model';
import { useStore } from '../lib/store';
export function IntegratedProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    state,
    setState
  } = useStore();
  function applySaved(p: Preferences) {
    const {
      font,
      fontSize,
      lineHeight,
      width,
      theme
    } = p;
    setState(s => ({
      ...s,
      preferences: {
        font,
        fontSize,
        lineHeight,
        width,
        theme
      }
    }));
  }
  return <DemoProvider initialPreferences={state.preferences} onSaved={applySaved}>{children}</DemoProvider>;
}
export function RouteSurface() {
  const {
    pathname
  } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = pathname.startsWith('/reader/') ? 'reader' : 'app';
    window.scrollTo(0, 0);
    document.title = 'Readict · 原版阅读';
  }, [pathname]);
  return <Outlet />;
}
export function AppShell() {
  const {
    storageError
  } = useDemo();
  const {
    pathname
  } = useLocation();
  return <div className="uc-app rd-app"><MemberHeader key={pathname} />{storageError && <p className="uc-storage-error" role="alert">{storageError}</p>}<div className="rd-route-content"><Outlet /></div><footer className="rd-footer"><span>Readict <span>读原文，也读懂每一个词。</span></span><span>{new URLSearchParams(window.location.search).get('demo') === 'library' ? '设计演示 · 示例阅读记录' : '交互原型 · 记录保存在此浏览器'}</span><Link to="/account">账户与设置</Link></footer><DemoTools /></div>;
}
export function DemoGate({
  children
}: {
  children: ReactNode;
}) {
  const {
      authenticated
    } = useDemo(),
    {
      pathname
    } = useLocation();
  return authenticated ? children : <Navigate to="/login" replace state={{
    from: pathname
  }} />;
}
