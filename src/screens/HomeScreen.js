import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Share, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, BookOpen, RefreshCw, Share2 } from 'lucide-react-native';
import { SIZES, SHADOWS } from '../utils/theme';
import BookCard from '../components/BookCard';
import { useThemeStore } from '../store/themeStore';
import { searchBooks } from '../services/api';
import { useLibraryStore } from '../store/libraryStore';

const CATEGORIES = [
  { id: 'all', name: 'Genel' },
  { id: 'Roman', name: 'Roman' },
  { id: 'Şiir', name: 'Şiir' },
  { id: 'Tarih', name: 'Tarih' },
  { id: 'Bilim', name: 'Bilim' },
  { id: 'Klasikler', name: 'Klasikler' },
];

const LANGUAGES = [
  { id: '', name: '🌍 Tüm Diller' },
  { id: 'tr', name: '🇹🇷 Türkçe' },
  { id: 'en', name: '🇬🇧 İngilizce' },
  { id: 'ru', name: '🇷🇺 Rusça' },
  { id: 'de', name: '🇩🇪 Almanca' },
];

const QUOTES = [
  { text: "Dünyanın gördüğü her büyük başarı, önce bir hayaldi. En büyük çınar bir tohumdu, en büyük kuş bir yumurtada gizliydi.", author: "James Allen" },
  { text: "Bütün mutlu aileler birbirine benzer; her mutsuz ailenin ise kendine özgü bir mutsuzluğu vardır.", author: "Lev Tolstoy" },
  { text: "Kitapsız yaşamak, kör sağır, dilsiz yaşamaktır.", author: "Seneca" },
  { text: "Bir kitap, içimizdeki donmuş denize indirilmiş bir baltadır.", author: "Franz Kafka" },
  { text: "Okumak, uçmayı öğrenmektir.", author: "A. Huxley" },
  { text: "Düşünüyorum, öyleyse varım.", author: "Rene Descartes" },
  { text: "Aklın gücü, hayal gücüyle sınırlıdır.", author: "Albert Einstein" },
  { text: "Mutluluk, kendi doğamıza uygun yaşamaktır.", author: "Baruch Spinoza" },
  { text: "Hayat, fırtınanın geçmesini beklemek değildir; yağmurda dans etmeyi öğrenmektir.", author: "Seneca" },
  { text: "Sorgulanmamış bir hayat yaşanmaya değmez.", author: "Sokrates" },
  { text: "Nereye gideceğini bilmeyen bir gemiye hiçbir rüzgar yardım edemez.", author: "Seneca" },
  { text: "En uzun yolculuk, insanın kendi içine yaptığı yolculuktur.", author: "Carl Jung" },
  { text: "Şans, hazırlıklı olan beyinlere güler.", author: "Louis Pasteur" },
  { text: "Bilgi, güçtür.", author: "Francis Bacon" },
  { text: "Dünyada görmek istediğin değişikliğin kendisi ol.", author: "Mahatma Gandhi" },
  { text: "Gerçek yolculuk yeni topraklar bulmak değil, yeni gözlerle bakmaktır.", author: "Marcel Proust" },
  { text: "İnsanın kendi kendini yenmesi, zaferlerin en büyüğüdür.", author: "Platon" },
  { text: "Aklını kitaplarla besle, yoksa cehalet seni kendi esiri yapar.", author: "Benjamin Franklin" },
];

export default function HomeScreen({ navigation }) {
  const { theme } = useThemeStore();
  const { 
    localBooks, 
    lastReadBookId,
    customCategories, 
    customLanguages, 
    addCategory, 
    addLanguage, 
    removeBook 
  } = useLibraryStore();
  
  const allCategories = [
    ...CATEGORIES, 
    ...customCategories.map(c => ({ id: c.toLowerCase(), name: c }))
  ];

  const allLanguages = [
    ...LANGUAGES,
    ...customLanguages.map(l => ({ id: l.toLowerCase(), name: l }))
  ];

  const styles = getStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddLang, setShowAddLang] = useState(false);
  const [newLangName, setNewLangName] = useState('');

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (allCategories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Mevcut', 'Bu kategori zaten var!');
      return;
    }
    addCategory(trimmed);
    setNewCatName('');
    setShowAddCategory(false);
  };

  const handleAddLanguage = () => {
    const trimmed = newLangName.trim();
    if (!trimmed) return;
    if (allLanguages.find(l => l.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Mevcut', 'Bu dil zaten var!');
      return;
    }
    addLanguage(trimmed);
    setNewLangName('');
    setShowAddLang(false);
  };

  const lastReadBook = localBooks.find(b => b.id === lastReadBookId);

  // Filter local books for "Kitaplığından" section 
  const matchedLocalBooks = localBooks.filter(book => {
    const langMatch = selectedLanguage === '' || (book.language && book.language.toLowerCase() === selectedLanguage.toLowerCase());
    const catMatch = selectedCategory === 'all' || (book.category && book.category.toLowerCase() === selectedCategory.toLowerCase());
    return langMatch && catMatch;
  });

  const handleRefreshQuote = () => {
    const randomIdx = Math.floor(Math.random() * QUOTES.length);
    setDailyQuote(QUOTES[randomIdx]);
  };

  const handleShareQuote = async () => {
    try {
      await Share.share({
        message: `"${dailyQuote.text}" — ${dailyQuote.author}\n\nLüks Kütüphanem'den Günün Alıntısı`,
      });
    } catch (err) {}
  };

  useEffect(() => {
    const fetchPop = async () => {
      setLoading(true);
      const query = selectedCategory === 'all' ? '' : selectedCategory;
      
      if (selectedLanguage === '') {
        const langs = ['tr', 'en', 'ru', 'de', ...customLanguages.map(l => l.toLowerCase())];
        const results = await Promise.all(
          langs.map(lang => searchBooks(query, lang))
        );
        
        let mixed = [];
        for (let i = 0; i < 5; i++) {
          langs.forEach((_, langIdx) => {
            if (results[langIdx][i]) {
              mixed.push(results[langIdx][i]);
            }
          });
        }
        setRecommended(mixed.slice(0, 10));
      } else {
        const data = await searchBooks(query, selectedLanguage);
        setRecommended(data.slice(0, 10)); 
      }
      setLoading(false);
    };
    fetchPop();
  }, [selectedCategory, selectedLanguage]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.primaryDark} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.headerTitle}>Ne okumak istersin?</Text>
            </View>
            <View style={styles.iconContainer}>
              <BookOpen color={theme.surface} size={28} />
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <Search color={theme.textSecondary} size={20} style={styles.searchIcon} />
            <TouchableOpacity 
              style={styles.searchInputArea}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.9}
            >
              <Text style={styles.searchPlaceholder}>Kitap PDF ara...</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: theme.text }]}>"{dailyQuote.text}"</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search', { initialQuery: dailyQuote.author })} activeOpacity={0.7}>
            <Text style={[styles.quoteAuthor, { color: theme.primary, textDecorationLine: 'underline' }]}>— {dailyQuote.author}</Text>
          </TouchableOpacity>
          <View style={styles.quoteActions}>
            <TouchableOpacity onPress={handleRefreshQuote} style={[styles.quoteActionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <RefreshCw color={theme.textSecondary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareQuote} style={[styles.quoteActionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Share2 color={theme.textSecondary} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Category Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {allCategories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? localBooks.length 
                : localBooks.filter(b => (b.category || '').toLowerCase() === cat.id.toLowerCase()).length;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.categoryChip, { backgroundColor: isActive ? theme.primary : theme.border }]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, { color: isActive ? theme.surface : theme.text }]}>
                    {cat.name}{count > 0 ? ` (${count})` : ''}
                  </Text>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity 
              style={[styles.categoryChip, styles.addChip, { borderColor: theme.primary }]}
              onPress={() => setShowAddCategory(true)}
            >
              <Text style={[styles.categoryText, { color: theme.primary, fontSize: 16 }]}>＋</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Language Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {allLanguages.map(lang => {
              const isActive = selectedLanguage === lang.id;
              const count = lang.id === '' 
                ? localBooks.length 
                : localBooks.filter(b => (b.language || '').toLowerCase() === lang.id.toLowerCase()).length;
              return (
                <TouchableOpacity 
                  key={lang.id} 
                  style={[styles.categoryChip, { backgroundColor: isActive ? theme.secondary : theme.border }]}
                  onPress={() => setSelectedLanguage(lang.id)}
                >
                  <Text style={[styles.categoryText, { color: isActive ? theme.surface : theme.text }]}>
                    {lang.name}{count > 0 ? ` (${count})` : ''}
                  </Text>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity 
              style={[styles.categoryChip, styles.addChip, { borderColor: theme.secondary }]}
              onPress={() => setShowAddLang(true)}
            >
              <Text style={[styles.categoryText, { color: theme.secondary, fontSize: 16 }]}>＋</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Son Okunan Section (Fixed top) */}
          {lastReadBook && (
            <View style={{ marginBottom: SIZES.lg }}>
              <Text style={styles.sectionTitle}>Son Okunan</Text>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Detail', { book: lastReadBook })}
                style={[styles.featuredCard, { backgroundColor: theme.surface }]}
              >
                 <Image source={{ uri: lastReadBook.cover }} style={styles.featuredCover} />
                 <View style={styles.featuredInfo}>
                    <Text style={[styles.featuredTitle, { color: theme.text }]} numberOfLines={1}>{lastReadBook.title}</Text>
                    <Text style={[styles.featuredAuthor, { color: theme.textSecondary }]}>{lastReadBook.author}</Text>
                    <View style={styles.miniProgressRow}>
                       <View style={styles.miniProgressBarBg}>
                          <View style={[styles.miniProgressBarFill, { width: `${lastReadBook.progress || 0}%`, backgroundColor: theme.primary }]} />
                       </View>
                       <Text style={[styles.miniProgressText, { color: theme.primary }]}>%{Math.round(lastReadBook.progress || 0)}</Text>
                    </View>
                 </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Kitaplığından Section */}
          <View style={{ marginBottom: SIZES.lg }}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Kitaplığından' : `${allCategories.find(c => c.id === selectedCategory)?.name || 'Kategori'} Klasörü`} ({matchedLocalBooks.length})
            </Text>
            {matchedLocalBooks.length > 0 ? (
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.localBooksRow}>
                  {matchedLocalBooks.map(book => (
                    <View key={book.id} style={{ width: 140, marginRight: 15 }}>
                      <BookCard 
                         title={book.title}
                         author={book.author}
                         coverUrl={book.cover}
                         language={book.language}
                         order={book.order}
                         progress={book.progress}
                         isFinished={book.isFinished}
                         onPress={() => navigation.navigate('Detail', { book })}
                         onDelete={() => removeBook(book.id)}
                      />
                    </View>
                  ))}
               </ScrollView>
            ) : (
              <View style={[styles.emptyKutu, { borderColor: theme.border }]}>
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                  Bu {selectedCategory !== 'all' ? 'klasör' : 'dil'} şu an boş.
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Keşfet</Text>
          {loading ? (
            <View style={{ paddingVertical: 100, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : recommended.length === 0 ? (
            <View style={{ paddingVertical: 100, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary }}>Bu kategoride veya dilde kitap bulunamadı.</Text>
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {recommended.map(book => (
                <View style={styles.gridItem} key={book.id}>
                  <BookCard 
                    title={book.title}
                    author={book.author}
                    coverUrl={book.cover}
                    language={book.language}
                    onPress={() => navigation.navigate('Detail', { book })}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} transparent animationType="fade" onRequestClose={() => setShowAddCategory(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Yeni Kategori Ekle</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Kategori adı..."
              placeholderTextColor={theme.textSecondary}
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => { setShowAddCategory(false); setNewCatName(''); }}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleAddCategory}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Language Modal */}
      <Modal visible={showAddLang} transparent animationType="fade" onRequestClose={() => setShowAddLang(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Yeni Dil Ekle</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Ör: Fransızca, Arapça..."
              placeholderTextColor={theme.textSecondary}
              value={newLangName}
              onChangeText={setNewLangName}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => { setShowAddLang(false); setNewLangName(''); }}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.secondary }]} onPress={handleAddLanguage}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xxl + 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: SIZES.lg,
    paddingHorizontal: SIZES.md,
    height: 52,
    ...SHADOWS.medium,
    position: 'absolute',
    bottom: -26,
    left: SIZES.lg,
    right: SIZES.lg,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: SIZES.sm,
  },
  searchInputArea: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  quoteContainer: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl + 20,
    paddingBottom: SIZES.sm,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xs,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quoteActions: {
    flexDirection: 'row',
    marginTop: SIZES.sm,
    justifyContent: 'center',
    gap: SIZES.md,
  },
  quoteActionButton: {
    padding: SIZES.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    paddingTop: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  categoryChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    marginRight: SIZES.sm,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SIZES.md,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: SIZES.xxl,
  },
  gridItem: {
    width: '48%',
    marginBottom: SIZES.md,
  },
  localBooksRow: {
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  addChip: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  featuredCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featuredCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  featuredInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredAuthor: {
    fontSize: 14,
    marginBottom: 10,
  },
  miniProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniProgressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginRight: 10,
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  miniProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 35,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyKutu: {
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  }
});
