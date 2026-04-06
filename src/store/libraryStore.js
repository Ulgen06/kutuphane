import { create } from 'zustand';
import { TURKISH_BOOKS } from '../data/turkishBooks';

export const useLibraryStore = create((set, get) => ({
  localBooks: [...TURKISH_BOOKS],
  readingHistory: [], // Persistent record of all books (even if deleted from shelf)
  lastReadBookId: null,
  customCategories: [],
  customLanguages: [],

  // Track Last Read
  setLastRead: (id) => set({ lastReadBookId: id }),

  // Add/Update Book
  addBook: (book) => set((state) => {
    const id = book.id || Date.now().toString();
    const newBook = { ...book, id, addedAt: new Date().toISOString() };
    
    // Update History too
    const historyExists = state.readingHistory.some(b => b.id === id);
    const updatedHistory = historyExists 
      ? state.readingHistory.map(b => b.id === id ? { ...b, ...newBook } : b)
      : [...state.readingHistory, newBook];

    const exists = state.localBooks.some(b => b.id === id);
    if (exists) {
      return { 
        localBooks: state.localBooks.map(b => b.id === id ? { ...b, ...newBook } : b),
        readingHistory: updatedHistory
      };
    }
    return { 
      localBooks: [newBook, ...state.localBooks],
      readingHistory: updatedHistory
    };
  }),

  // Remove Book (But keep in history if read)
  removeBook: (id) => set((state) => {
    const bookToRemove = state.localBooks.find(b => b.id === id);
    if (bookToRemove) {
      // Ensure it's in history before removing from shelf
      const historyExists = state.readingHistory.some(b => b.id === id);
      const updatedHistory = historyExists 
        ? state.readingHistory.map(b => b.id === id ? { ...b, ...bookToRemove, removedFromShelf: true } : b)
        : [...state.readingHistory, { ...bookToRemove, removedFromShelf: true }];
      
      return {
        localBooks: state.localBooks.filter((book) => book.id !== id),
        readingHistory: updatedHistory,
        lastReadBookId: state.lastReadBookId === id ? null : state.lastReadBookId
      };
    }
    return state;
  }),

  // Mark as Finished
  markAsFinished: (id) => set((state) => ({
    localBooks: state.localBooks.map(b => b.id === id ? { ...b, progress: 100, isFinished: true, finishedAt: new Date().toISOString() } : b),
    readingHistory: state.readingHistory.map(b => b.id === id ? { ...b, progress: 100, isFinished: true, finishedAt: new Date().toISOString() } : b)
  })),

  // Update Progress
  updateProgress: (id, progress) => set((state) => ({
    localBooks: state.localBooks.map(book => 
      book.id === id ? { ...book, progress } : book
    ),
    readingHistory: state.readingHistory.map(book => 
      book.id === id ? { ...book, progress } : book
    ),
    lastReadBookId: id // Automatically set as last read when progress updates
  })),

  // Theme/Categories
  addCategory: (name) => set((state) => ({
    customCategories: state.customCategories.includes(name) ? state.customCategories : [...state.customCategories, name]
  })),
  addLanguage: (name) => set((state) => ({
    customLanguages: state.customLanguages.includes(name) ? state.customLanguages : [...state.customLanguages, name]
  })),

  resetToDefaults: () => set({ 
    localBooks: [...TURKISH_BOOKS], 
    readingHistory: [], 
    lastReadBookId: null 
  }),
  
  clearLibrary: () => set({ localBooks: [], lastReadBookId: null })
}));
