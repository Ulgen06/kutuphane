import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { Library, Plus, Book, Star, FileUp } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SIZES, SHADOWS } from '../utils/theme';
import BookCard from '../components/BookCard';
import { BOOK_CATEGORIES } from '../data/turkishBooks';

const LANGUAGES = [
  { id: 'TR', name: 'Türkçe' },
  { id: 'EN', name: 'İngilizce' },
  { id: 'RU', name: 'Rusça' },
  { id: 'DE', name: 'Almanca' },
];

const BASE_CATEGORIES = [
  { id: 'Roman',   name: 'Roman' },
  { id: 'Şiir',    name: 'Şiir' },
  { id: 'Tarih',   name: 'Tarih' },
  { id: 'Bilim',   name: 'Bilim' },
  { id: 'Klasikler', name: 'Klasikler' },
];

export default function LibraryScreen({ navigation }) {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const { localBooks, addBook, customCategories, removeBook, customLanguages, readingHistory } = useLibraryStore();
  const [activeShelf, setActiveShelf] = useState('all');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', category: 'Roman', language: 'TR', uri: '' });

  const displayBooks = activeShelf === 'all' 
    ? localBooks 
    : activeShelf === 'favorites' 
      ? localBooks.filter(book => book.rating && book.rating >= 4)
      : readingHistory.filter(book => book.isFinished);

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/html'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setNewBook({
          title: file.name.replace(/\.[^/.]+$/, ""), 
          author: '',
          category: 'Genel',
          language: 'TR',
          uri: file.uri
        });
        setImportModalVisible(true);
      }
    } catch (error) {
      console.log('Import err', error);
    }
  };

  const saveImportedBook = () => {
    if (!newBook.title || !newBook.author) {
      alert('Lütfen başlık ve yazar girin');
      return;
    }

    addBook({
      ...newBook,
      id: Date.now().toString(),
      cover: null,
      downloadUrl: newBook.uri,
      progress: 0,
      order: localBooks.length + 1, // Otomatik sıra numarası
    });
    setImportModalVisible(false);
    setNewBook({ title: '', author: '', category: 'Roman', language: 'TR', uri: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Library color={theme.text} size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Kitaplığım</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleImport} activeOpacity={0.8}>
          <FileUp color={theme.surface} size={18} />
          <Text style={styles.addButtonText}>Kitap Ekle</Text>
        </TouchableOpacity>
      </View>

      {(localBooks.length > 0 || readingHistory.some(b => b.isFinished)) && (
        <View style={styles.shelfTabs}>
          <TouchableOpacity onPress={() => setActiveShelf('all')} style={[styles.shelfTab, activeShelf === 'all' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}>
            <Text style={[styles.shelfTabText, { color: activeShelf === 'all' ? theme.text : theme.textSecondary }]}>Tüm Kitaplar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveShelf('favorites')} style={[styles.shelfTab, activeShelf === 'favorites' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}>
            <Star color={activeShelf === 'favorites' ? theme.primary : theme.textSecondary} size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.shelfTabText, { color: activeShelf === 'favorites' ? theme.text : theme.textSecondary }]}>Başucu & Favoriler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveShelf('finished')} style={[styles.shelfTab, activeShelf === 'finished' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}>
            <Book color={activeShelf === 'finished' ? theme.primary : theme.textSecondary} size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.shelfTabText, { color: activeShelf === 'finished' ? theme.text : theme.textSecondary }]}>Bitenler</Text>
          </TouchableOpacity>
        </View>
      )}
      {displayBooks.length === 0 ? (
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Book color={theme.textSecondary} size={48} />
          </View>
          <Text style={styles.emptyTitle}>Kitaplığınız Henüz Boş</Text>
          <Text style={styles.emptySubtitle}>İnternetten indirdiğiniz veya kendinize ait PDF kitapları buraya güvenle ekleyebilirsiniz.</Text>
          <TouchableOpacity style={styles.bigImportButton} onPress={handleImport}>
             <FileUp color={theme.surface} size={20} style={{ marginRight: 8 }}/>
             <Text style={styles.bigImportButtonText}>Hemen Kitap İçe Aktar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {displayBooks.map(book => (
              <View style={styles.cardWrapper} key={book.id}>
                <BookCard 
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover}
                  order={book.order}
                  progress={book.progress || 0}
                  onPress={() => navigation.navigate('Detail', { book })}
                  onDelete={() => removeBook(book.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal visible={importModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={styles.modalTitle}>Kitap Detaylarını Onayla</Text>
            
            <Text style={styles.label}>Kitap Adı</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} 
              value={newBook.title}
              onChangeText={t => setNewBook({...newBook, title: t})}
            />

            <Text style={styles.label}>Yazar</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} 
              value={newBook.author}
              placeholder="Yazar adı girin..."
              placeholderTextColor={theme.textSecondary}
              onChangeText={t => setNewBook({...newBook, author: t})}
            />

            <Text style={styles.label}>Kategori Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
               {[...BASE_CATEGORIES.map(c => c.name), ...customCategories].map(cat => (
                 <TouchableOpacity 
                   key={cat} 
                   style={[styles.chip, newBook.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                   onPress={() => setNewBook({...newBook, category: cat})}
                 >
                   <Text style={[styles.chipText, { color: newBook.category === cat ? theme.surface : theme.textSecondary }]}>{cat}</Text>
                 </TouchableOpacity>
               ))}
               <TouchableOpacity 
                 style={[styles.chip, { borderStyle: 'dashed', borderColor: theme.primary }]}
                 onPress={() => { setImportModalVisible(false); navigation.navigate('Home'); }}
               >
                 <Text style={[styles.chipText, { color: theme.primary }]}>＋ Yeni Ekle</Text>
               </TouchableOpacity>
            </ScrollView>

            <Text style={styles.label}>Dil Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
               {[...LANGUAGES, ...customLanguages.map(l => ({ id: l.toUpperCase(), name: l }))].map(lang => (
                 <TouchableOpacity 
                   key={lang.id} 
                   style={[styles.chip, newBook.language === lang.id && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
                   onPress={() => setNewBook({...newBook, language: lang.id})}
                 >
                   <Text style={[styles.chipText, { color: newBook.language === lang.id ? theme.surface : theme.textSecondary }]}>{lang.name}</Text>
                 </TouchableOpacity>
               ))}
               <TouchableOpacity 
                 style={[styles.chip, { borderStyle: 'dashed', borderColor: theme.secondary }]}
                 onPress={() => { setImportModalVisible(false); navigation.navigate('Home'); }}
               >
                 <Text style={[styles.chipText, { color: theme.secondary }]}>＋ Yeni Ekle</Text>
               </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.border }]} onPress={() => setImportModalVisible(false)}>
                <Text style={{ color: theme.text }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={saveImportedBook}>
                <Text style={{ color: theme.surface, fontWeight: 'bold' }}>Kitaplığa Ekle</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  shelfTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: SIZES.lg,
  },
  shelfTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    marginRight: SIZES.xl,
  },
  shelfTabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: theme.surface,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: SIZES.xl,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  bigImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.lg,
    ...SHADOWS.medium,
  },
  bigImportButtonText: {
    color: theme.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: SIZES.xl,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: theme.text,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
    height: 34,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
