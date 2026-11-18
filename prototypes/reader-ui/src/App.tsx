import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StoreProvider } from '@/lib/store'
import { lazy, Suspense } from 'react'
const ReaderPage = lazy(() => import('@/components/Reader').then(m => ({ default: m.ReaderPage })))
const BookshelfPage = lazy(() => import('@/components/Bookshelf').then(m => ({ default: m.BookshelfPage })))
const FavoritesPage = lazy(() => import('@/components/Favorites').then(m => ({ default: m.FavoritesPage })))
import './readict.css'

export default function App() {
  return <StoreProvider><TooltipProvider delay={250}><HashRouter><Suspense fallback={<div className="empty-state" role="status">正在打开书页…</div>}><Routes><Route path="/books" element={<BookshelfPage />} /><Route path="/reader/:bookId" element={<ReaderPage />} /><Route path="/favorites" element={<FavoritesPage />} /><Route path="*" element={<Navigate to="/reader/pride" replace />} /></Routes></Suspense></HashRouter><Toaster position="bottom-right" duration={2200} richColors closeButton /></TooltipProvider></StoreProvider>
}
