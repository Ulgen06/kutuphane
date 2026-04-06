import { create } from 'zustand';

export const useQuoteStore = create((set) => ({
  quotes: [],
  
  addQuote: (text, author, bookTitle) => set((state) => ({
    quotes: [{ id: Date.now().toString(), text, author, bookTitle, date: new Date().toISOString() }, ...state.quotes]
  })),

  removeQuote: (id) => set((state) => ({
    quotes: state.quotes.filter(q => q.id !== id)
  }))
}));
