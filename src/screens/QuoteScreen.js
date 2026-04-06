import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useQuoteStore } from '../store/quoteStore';
import { BookMarked, Plus, Trash2, Quote as QuoteIcon, X } from 'lucide-react-native';
import { SIZES, SHADOWS } from '../utils/theme';

export default function QuoteScreen() {
  const { theme } = useThemeStore();
  const { quotes, addQuote, removeQuote } = useQuoteStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', bookTitle: '' });
  
  const styles = getStyles(theme);

  const handleAdd = () => {
    if (!newQuote.text) return;
    addQuote(newQuote.text, newQuote.author, newQuote.bookTitle);
    setNewQuote({ text: '', author: '', bookTitle: '' });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <QuoteIcon color={theme.text} size={28} style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Alıntı Defterim</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color={theme.surface} size={20} />
        </TouchableOpacity>
      </View>

      {quotes.length === 0 ? (
        <View style={styles.emptyContent}>
          <QuoteIcon color={theme.textSecondary} size={64} style={{ marginBottom: 20, opacity: 0.2 }} />
          <Text style={styles.emptyTitle}>Defteriniz Boş</Text>
          <Text style={styles.emptySubtitle}>Okurken ruhunuza dokunan cümleleri buraya kaydedin. Bilgelik biriktirmeye bugün başlayın.</Text>
          <TouchableOpacity style={styles.bigAddBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.bigAddBtnText}>Yeni Alıntı Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {quotes.map(item => (
            <View key={item.id} style={[styles.quoteCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
               <QuoteIcon color={theme.primary} size={16} style={{ marginBottom: 10, opacity: 0.5 }} />
               <Text style={[styles.quoteText, { color: theme.text }]}>{item.text}</Text>
               <View style={styles.quoteFooter}>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.quoteAuthor, { color: theme.primary }]}>{item.author || 'Anonim'}</Text>
                   <Text style={[styles.quoteBook, { color: theme.textSecondary }]}>{item.bookTitle || 'Kaynak Belirtilmedi'}</Text>
                 </View>
                 <TouchableOpacity onPress={() => removeQuote(item.id)}>
                   <Trash2 color="#EF4444" size={18} />
                 </TouchableOpacity>
               </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Yeni Alıntı Kaydet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={theme.text} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Alıntı Metni</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]} 
              multiline
              numberOfLines={4}
              placeholder="O efsane cümleyi buraya yazın..."
              placeholderTextColor={theme.textSecondary}
              value={newQuote.text}
              onChangeText={t => setNewQuote({...newQuote, text: t})}
            />

            <Text style={styles.label}>Yazar / Kişi</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} 
              placeholder="Yazar adı..."
              value={newQuote.author}
              onChangeText={t => setNewQuote({...newQuote, author: t})}
            />

            <Text style={styles.label}>Kitap Başlığı</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} 
              placeholder="Hangi kitaptan?.."
              value={newQuote.bookTitle}
              onChangeText={t => setNewQuote({...newQuote, bookTitle: t})}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Deftere Kaydet</Text>
            </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  list: {
    padding: 20,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 15,
  },
  quoteFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quoteBook: {
    fontSize: 12,
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
    marginBottom: 30,
  },
  bigAddBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    ...SHADOWS.medium,
  },
  bigAddBtnText: {
    color: theme.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    ...SHADOWS.medium,
  },
  saveBtnText: {
    color: theme.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
