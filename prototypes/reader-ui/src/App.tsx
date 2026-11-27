import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StoreProvider } from '@/lib/store';
import { lazy, Suspense } from 'react';
import { Account, Settings, Auth } from './user-center/screens';
import { AppShell, DemoGate, IntegratedProvider, RouteSurface } from './integrated/Shell';
import './readict.css';
import './user-center/user-center.css';
import './integrated/modern.css';
const ReaderPage = lazy(() => import('@/components/Reader').then(m => ({
  default: m.ReaderPage
})));
const BookshelfPage = lazy(() => import('./integrated/Bookshelf').then(m => ({
  default: m.BookshelfPage
})));
const FavoritesPage = lazy(() => import('@/components/Favorites').then(m => ({
  default: m.FavoritesPage
})));
export default function App() {
  return <StoreProvider><TooltipProvider delay={250}><HashRouter><IntegratedProvider><Suspense fallback={<div className="empty-state" role="status">正在打开书页…</div>}><Routes><Route element={<RouteSurface />}><Route path="/reader/:bookId" element={<ReaderPage />} /><Route element={<AppShell />}>
    <Route path="/books" element={<BookshelfPage />} /><Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/account" element={<DemoGate><Account /></DemoGate>} /><Route path="/settings/*" element={<DemoGate><Settings /></DemoGate>} />
    {(['login', 'register', 'forgot-password', 'reset-password'] as const).map(mode => <Route key={mode} path={`/${mode}`} element={<Auth key={mode} mode={mode} />} />)}
    <Route path="*" element={<Navigate to="/books" replace />} />
  </Route></Route></Routes></Suspense><Toaster position="bottom-right" duration={2200} richColors closeButton /></IntegratedProvider></HashRouter></TooltipProvider></StoreProvider>;
}
