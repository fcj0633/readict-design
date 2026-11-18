export interface Chapter { id: string; title: string; paragraphs: string[] }
export interface Book { id: string; title: string; author: string; subtitle: string; cover: string; chapters: Chapter[]; imported?: boolean }
export interface ReadingLocation { bookId: string; chapterId: string; offset: number; updatedAt: number }
export interface ReaderPreferences { font: 'Georgia' | 'Palatino Linotype' | 'Arial'; fontSize: number; lineHeight: number; width: number; theme: 'warm' | 'white' | 'dark' }
export interface Sense { pos: string; meaning: string }
export interface DictionaryEntry { lemma: string; ipa: string; senses: Sense[]; source: string }
export interface WordContext { id: string; bookId: string; bookTitle: string; chapterId: string; chapterTitle: string; sentence: string; original: string; start: number; end: number; offset: number; translation?: string }
export interface FavoriteWord { lemma: string; ipa: string; sense: Sense; createdAt: number; contexts: WordContext[] }
export interface Selection { word: string; element: HTMLElement; context: WordContext }
export interface StoredState { preferences: ReaderPreferences; progress: Record<string, ReadingLocation>; favorites: FavoriteWord[]; translations: Record<string, string>; removedBooks: string[]; importedBooks: Book[] }
