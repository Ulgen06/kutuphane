import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { Star } from 'lucide-react-native';
import BookCard from '../components/BookCard';
import { SIZES } from '../utils/theme';

export default function FavoritesScreen({ navigation }) {
  const { theme } = useThemeStore();
  const { localBooks, removeBook } = useLibraryStore();
  const styles = getStyles(theme);

  const favoriteBooks = localBooks.filter(book => book.rating && book.rating >= 4);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Star color={theme.primary} size={28} fill={theme.primary} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Favorilerim</Text>
      </View>

      {favoriteBooks.length === 0 ? (
        <View style={styles.emptyContent}>
          <Star color={theme.textSecondary} size={64} style={{ marginBottom: 20, opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>Henüz Favoriniz Yok</Text>
          <Text style={styles.emptySubtitle}>Okuduğunuz ve 4 yıldız üzeri puan verdiğiniz kitaplar otomatik olarak burada lüks bir rafta toplanır.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {favoriteBooks.map(book => (
              <View style={styles.cardWrapper} key={book.id}>
                <BookCard 
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover}
                  onPress={() => navigation.navigate('Reader', { book })}
                  onDelete={() => removeBook(book.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
    padding: 24,
    paddingTop: 32,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});
