import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { useProfileStore } from '../store/profileStore';
import { useMusicStore } from '../store/musicStore';
import { PALETTES, SIZES, SHADOWS } from '../utils/theme';
import { Palette, CheckCircle2, User, Flame, Clock, Shield, Trophy, Target, ChevronRight, Music, Play, Pause, RefreshCw } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, activeThemeKey, setTheme } = useThemeStore();
  const { totalFocusSeconds, currentStreak, xp, level, yearlyGoal, booksFinishedThisYear } = useProfileStore();
  const { tracks, playTrack, activeTrackId, isPlaying } = useMusicStore();
  const { resetToDefaults } = useLibraryStore();
  const styles = getStyles(theme);

  const handleReset = () => {
    Alert.alert(
      'Kütüphaneyi Sıfırla',
      'Mevcut tüm kitapların silinecek ve yeni küratörlü 50+ Türk Klasiği seti yüklenecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla ve Yükle', style: 'destructive', onPress: () => resetToDefaults() }
      ]
    );
  };

  const formatHours = (secs) => (secs / 3600).toFixed(1);

  const getRank = (lvl) => {
    if (lvl >= 50) return { title: 'Antik Bilgin', icon: <Trophy color="#FBBF24" size={20} /> };
    if (lvl >= 25) return { title: 'Bilge Gezgin', icon: <Shield color="#8B5CF6" size={20} /> };
    if (lvl >= 10) return { title: 'Kitap Kurdu', icon: <Shield color="#3B82F6" size={20} /> };
    return { title: 'Çırak Okur', icon: <Shield color="#94A3B8" size={20} /> };
  };

  const rank = getRank(level);
  const nextLevelXp = level * 500;
  const progress = (xp % 500) / 500;
  const yearlyProgress = Math.min(booksFinishedThisYear / yearlyGoal, 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <User color={theme.text} size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Profilim</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Card */}
        <View style={[styles.characterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.charHeader}>
             <View style={[styles.avatarBox, { backgroundColor: theme.primary + '20' }]}>
                <User color={theme.primary} size={40} />
             </View>
             <View style={styles.charInfo}>
                <Text style={[styles.charName, { color: theme.text }]}>Kütüphane Üyesi</Text>
                <View style={styles.rankBadge}>
                   {rank.icon}
                   <Text style={[styles.rankText, { color: theme.textSecondary }]}>{rank.title}</Text>
                </View>
             </View>
             <View style={styles.levelBadge}>
                <Text style={styles.levelNum}>{level}</Text>
                <Text style={styles.levelLabel}>LVL</Text>
             </View>
          </View>
          
          <View style={styles.xpBarContainer}>
             <View style={styles.xpInfo}>
                <Text style={styles.xpLabel}>Tecrübe (XP)</Text>
                <Text style={styles.xpValue}>{xp % 500} / 500</Text>
             </View>
             <View style={[styles.xpBg, { backgroundColor: theme.border }]}>
                <View style={[styles.xpFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
             </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Flame color="#F97316" size={28} style={{ marginBottom: 8 }} />
            <Text style={[styles.statValue, { color: theme.text }]}>{currentStreak} Gün</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Seri</Text>
          </View>
          
          <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Clock color={theme.primary} size={28} style={{ marginBottom: 8 }} />
            <Text style={[styles.statValue, { color: theme.text }]}>{formatHours(totalFocusSeconds)} Sa</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Odak</Text>
          </View>

          <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Target color="#10B981" size={28} style={{ marginBottom: 8 }} />
            <Text style={[styles.statValue, { color: theme.text }]}>{booksFinishedThisYear}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bitirilen</Text>
          </View>
        </View>

        {/* Yearly Goal Section */}
        <View style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
           <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, { color: theme.text }]}>2026 Okuma Hedefi</Text>
              <Text style={[styles.goalTarget, { color: theme.primary }]}>{booksFinishedThisYear} / {yearlyGoal}</Text>
           </View>
           <View style={[styles.goalBg, { backgroundColor: theme.border }]}>
              <View style={[styles.goalFill, { width: `${yearlyProgress * 100}%`, backgroundColor: '#10B981' }]} />
           </View>
           <Text style={styles.goalSubtext}>Hedefine ulaşmak için {yearlyGoal - booksFinishedThisYear} kitap daha bitirmelisin!</Text>
        </View>

        {/* Music Player Section */}
        <Text style={styles.sectionTitle}>Zen Müzik Odası</Text>
        <Text style={styles.description}>Okurken sizi o anın içine hapsedecek 8 farklı ambiyans müziği. Odaklanmanızı zirveye taşıyın.</Text>
        <View style={styles.musicGrid}>
           {tracks.map(track => {
             const isCurrent = activeTrackId === track.id;
             return (
               <TouchableOpacity 
                  key={track.id} 
                  style={[styles.musicCard, { backgroundColor: theme.surface, borderColor: isCurrent ? theme.primary : theme.border }]}
                  onPress={() => playTrack(track.id)}
               >
                  <Text style={styles.trackIcon}>{track.icon}</Text>
                  <Text style={[styles.trackName, { color: theme.text }]} numberOfLines={1}>{track.name}</Text>
                  <View style={[styles.playIndicator, { backgroundColor: isCurrent ? theme.primary : theme.border }]}>
                     {(isCurrent && isPlaying) ? <Pause color="#FFF" size={12} /> : <Play color={isCurrent ? "#FFF" : theme.textSecondary} size={12} />}
                  </View>
               </TouchableOpacity>
             )
           })}
        </View>

        <Text style={styles.sectionTitle}>Tema ve Tasarım Tercihi</Text>
        <Text style={styles.description}>
          Uygulama deneyiminizi lüks ve otantik Türk temalarıyla kişiselleştirin. Seçtiğiniz renk vurgusu anında menülere, butonlara ve okuyucuya yansıtılacaktır.
        </Text>

        <View style={styles.grid}>
          {Object.entries(PALETTES).map(([key, palette]) => {
            const isActive = activeThemeKey === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  { 
                    backgroundColor: palette.surface, 
                    borderColor: isActive ? palette.primary : palette.border,
                    borderWidth: isActive ? 2 : 1
                  }
                ]}
                onPress={() => setTheme(key)}
                activeOpacity={0.8}
              >
                <View style={[styles.colorCircle, { backgroundColor: palette.primary }]} />
                
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: palette.text }]}>{palette.name}</Text>
                  <Text style={[styles.themeSubtitle, { color: palette.textSecondary }]}>
                    {palette.isDark ? 'Karanlık Mod' : 'Aydınlık Mod'}
                  </Text>
                </View>

                {isActive && <CheckCircle2 color={palette.primary} size={24} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 40, marginBottom: 60 }}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Tehlikeli Bölge</Text>
          <TouchableOpacity 
            style={[styles.resetBtn, { borderColor: '#EF4444' }]} 
            onPress={handleReset}
          >
            <RefreshCw color="#EF4444" size={20} style={{ marginRight: 10 }} />
            <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Kütüphaneyi Sıfırla & 50+ Kitabı Yükle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  content: {
    padding: SIZES.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  statBox: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.lg,
    borderRadius: SIZES.lg,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: SIZES.xl,
    lineHeight: 24,
  },
  grid: {
    gap: SIZES.md,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.lg,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  themeSubtitle: {
    fontSize: 12,
  },
  characterCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  charHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charInfo: {
    flex: 1,
    marginLeft: 15,
  },
  charName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  levelBadge: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 45,
  },
  levelNum: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '800',
  },
  xpBarContainer: {
    marginTop: 10,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    color: 'gray',
  },
  xpValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
  },
  xpBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  statBox: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.lg,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  goalCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: SIZES.xl,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalTarget: {
    fontSize: 16,
    fontWeight: '800',
  },
  goalBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  goalFill: {
    height: '100%',
    borderRadius: 6,
  },
  goalSubtext: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  musicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SIZES.xl,
  },
  musicCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  trackIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  trackName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  playIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
  }
});
