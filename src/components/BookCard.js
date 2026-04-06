import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES, SHADOWS } from '../utils/theme';
import { useThemeStore } from '../store/themeStore';
import { Trash2 } from 'lucide-react-native';

export default function BookCard({ title, author, coverUrl, language, onPress, onDelete, order, progress = 0, isFinished = false }) {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.placeholderText}>{title.charAt(0)}</Text>
          </LinearGradient>
        )}
        {order && (
          <View style={[styles.orderBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.orderText}>#{order}</Text>
          </View>
        )}
        {language && !isFinished && (
          <View style={[styles.langBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </View>
        )}
        {isFinished && (
          <View style={[styles.finishedBadge, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.finishedText}>BİTTİ 🏆</Text>
          </View>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
        
        <View style={styles.progressRow}>
          <View style={[styles.progressLineBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressLineFill, { width: `${progress}%`, backgroundColor: theme.secondary }]} />
          </View>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    width: 140,
    marginRight: SIZES.md,
    backgroundColor: theme.surface,
    borderRadius: SIZES.md,
    ...SHADOWS.small,
  },
  imageContainer: {
    width: 140,
    height: 200,
    borderTopLeftRadius: SIZES.md,
    borderTopRightRadius: SIZES.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.surface,
  },
  info: {
    padding: SIZES.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  deleteBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  langBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  langText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  orderText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLineBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressLineFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.secondary,
    minWidth: 25,
  },
  finishedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
    ...SHADOWS.small,
  },
  finishedText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
