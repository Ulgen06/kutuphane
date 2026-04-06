import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SIZES } from '../utils/theme';
import { Search as SearchIcon, ArrowLeft, X } from 'lucide-react-native';
import BookCard from '../components/BookCard';
import { searchBooks } from '../services/api';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';

export default function SearchScreen({ route, navigation }) {
  const { theme } = useThemeStore();
  const { customLanguages } = useLibraryStore();
  const styles = getStyles(theme);

  const filterLangs = [
    { id: 'all', name: 'Tüm Diller' },
    { id: 'tr', name: 'Türkçe' },
    { id: 'en', name: 'İngilizce' },
    { id: 'ru', name: 'Rusça' },
    { id: 'de', name: 'Almanca' },
    ...customLanguages.map(l => ({ id: l.toLowerCase(), name: l }))
  ];

  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [language, setLanguage] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query, language);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, language]);

  const performSearch = async (text, lang) => {
    setLoading(true);
    const data = await searchBooks(text, lang);
    setResults(data);
    setLoading(false);
  };

  const navigateToReader = (book) => {
    navigation.navigate('Reader', { book });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchIcon color={theme.textSecondary} size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Kitap PDF Ara..."
            placeholderTextColor={theme.textSecondary}
            autoFocus
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterLangs.map(lang => {
            const isActive = language === lang.id;
            return (
              <TouchableOpacity 
                key={lang.id}
                style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => setLanguage(lang.id)}
              >
                <Text style={{ color: isActive ? theme.surface : theme.text, fontWeight: 'bold' }}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <BookCard 
                  title={item.title} 
                  author={item.author} 
                  coverUrl={item.cover} 
                  language={item.language}
                  onPress={() => navigateToReader(item)}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : query.trim().length > 2 ? (
          <Text style={styles.placeholderText}>Sonuç bulunamadı.</Text>
        ) : (
          <Text style={styles.placeholderText}>Kitap aramak için en az 3 harf girin.</Text>
        )}
      </View>
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
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    marginRight: SIZES.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: SIZES.md,
    paddingHorizontal: SIZES.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: theme.text,
  },
  filterBar: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: SIZES.sm,
  },
  content: {
    flex: 1,
    padding: SIZES.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  cardWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SIZES.xl,
  },
  loader: {
    marginTop: SIZES.xl,
  },
});
