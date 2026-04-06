import { create } from 'zustand';
let Audio;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  Audio = { Sound: { createAsync: () => ({ sound: { unloadAsync: () => {}, stopAsync: () => {}, playAsync: () => {}, pauseAsync: () => {} } }) } };
}

export const useMusicStore = create((set, get) => ({
  playbackInstance: null,
  activeTrackId: null,
  isPlaying: false,

  tracks: [
    { id: 'lofi', name: 'Derin Odak (Lofi)', url: 'https://www.soundjay.com/ambient/coffee-shop-1.mp3', icon: '🎧' },
    { id: 'rain', name: 'Gece Yağmuru', url: 'https://www.soundjay.com/nature/rain-01.mp3', icon: '🌧️' },
    { id: 'fire', name: 'Şömine Başı', url: 'https://www.soundjay.com/ambient/fireplace-1.mp3', icon: '🔥' },
    { id: 'forest', name: 'Gizemli Orman', url: 'https://www.soundjay.com/nature/forest-wind-01.mp3', icon: '🌲' },
    { id: 'ocean', name: 'Okyanus Kıyısı', url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3', icon: '🌊' },
    { id: 'piano', name: 'Yalnız Piyano', url: 'https://www.soundjay.com/misc/sounds-9-1.mp3', icon: '🎹' },
    { id: 'space', name: 'Kozmik Boşluk', url: 'https://www.soundjay.com/ambient/ambient-noise-01.mp3', icon: '🚀' },
    { id: 'library', name: 'Eski Kütüphane', url: 'https://www.soundjay.com/ambient/interior-restaurant-1.mp3', icon: '📚' },
  ],

  playTrack: async (trackId) => {
    const { playbackInstance, activeTrackId } = get();
    
    if (activeTrackId === trackId) {
      if (get().isPlaying) {
        await playbackInstance.pauseAsync();
        set({ isPlaying: false });
      } else {
        await playbackInstance.playAsync();
        set({ isPlaying: true });
      }
      return;
    }

    if (playbackInstance) {
      await playbackInstance.unloadAsync();
    }

    const track = get().tracks.find(t => t.id === trackId);
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true, isLooping: true, volume: 0.4 }
    );
    
    set({ playbackInstance: sound, activeTrackId: trackId, isPlaying: true });
  },

  stopAll: async () => {
    const { playbackInstance } = get();
    if (playbackInstance) {
      await playbackInstance.stopAsync();
      set({ isPlaying: false, activeTrackId: null });
    }
  }
}));
