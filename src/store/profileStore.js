import { create } from 'zustand';

export const useProfileStore = create((set) => ({
  totalFocusSeconds: 0,
  currentStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xp: 0,
  yearlyGoal: 24,
  booksFinishedThisYear: 0,
  level: 1,
  
  addFocusTime: (seconds) => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = state.currentStreak;
    
    if (state.lastActiveDate !== today) {
        newStreak += 1;
    }

    const addedXp = Math.floor(seconds / 6); // 10 XP per minute approx
    const newXp = state.xp + addedXp;
    const newLevel = Math.floor(newXp / 500) + 1;

    return {
      totalFocusSeconds: state.totalFocusSeconds + seconds,
      currentStreak: newStreak,
      lastActiveDate: today,
      xp: newXp,
      level: newLevel
    };
  }),

  finishBook: () => set((state) => ({
    booksFinishedThisYear: state.booksFinishedThisYear + 1,
    xp: state.xp + 100,
    level: Math.floor((state.xp + 100) / 500) + 1
  })),

  setYearlyGoal: (goal) => set({ yearlyGoal: goal }),

  resetStats: () => set({ totalFocusSeconds: 0, currentStreak: 1, xp: 0, level: 1, booksFinishedThisYear: 0 })
}));
