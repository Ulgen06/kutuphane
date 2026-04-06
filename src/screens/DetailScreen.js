import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Share, Platform, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { SIZES, SHADOWS } from '../utils/theme';
import { ArrowLeft, BookOpen, Star, Clock, Share2, BookmarkPlus, BookmarkCheck, Volume2, ImageIcon, Globe, FileText, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';

export default function DetailScreen({ route, navigation }) {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const { book } = route.params;

  const { localBooks, addBook, updateBookNotes, updateBookCover, removeBook, markAsFinished } = useLibraryStore();
  const localBook = localBooks.find(b => b.id === book.id);
  const isSavedLocally = !!localBook;

  const [rating, setRating] = useState(localBook?.rating || 0);
  const [notes, setNotes] = useState(localBook?.notes || '');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const estimatedPages = Math.max(120, Math.floor((book.title.length * 4) + 150));

  const handleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(`${book.title}. Yazarı: ${book.author}. Sevgili okur, bu şaheser uygulamamız kütüphanesinde okunmaya hazırdır.`, {
        language: book.language?.toLowerCase() === 'tr' ? 'tr-TR' : 'en-US',
        rate: 0.9,
        onDone: () => setIsSpeaking(false)
      });
    }
  };

  const handlePickCover = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && isSavedLocally) {
      updateBookCover(book.id, result.assets[0].uri);
    }
  };

  const toggleLibrary = () => {
    if (isSavedLocally) {
      removeBook(book.id);
    } else {
      addBook({ ...book, rating: 0, notes: '' });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mükemmel bir kitap buldum: ${book.title} - ${book.author} \n\nHemen oku: ${book.downloadUrl}`,
        title: book.title, 
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  const handleFinishBook = () => {
    if (!isSavedLocally) {
      if (Platform.OS === 'web') {
        if (window.confirm(`"${book.title}" kitabını henüz kütüphanene eklemedin. Önce eklemek ister misin?`)) {
          addBook(book);
        }
      } else {
        Alert.alert('Hata', 'Bu kitabı bitirmek için önce kütüphanene eklemelisin.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const choice = window.confirm(`"${book.title}" kitabını bitirdin! \n\n[Tamam]: Kütüphanede Kalsın \n[İptal]: Kütüphanemden Kaldır (Geçmişe Kaydet)`);
      if (choice) {
        markAsFinished(book.id);
        alert('Harika! Kitap "Bitti" olarak işaretlendi.');
      } else {
        markAsFinished(book.id);
        removeBook(book.id);
        navigation.goBack();
        alert('Tamamdır! Kitap kütüphanenden kaldırıldı ama geçmişinde saklanacak.');
      }
    } else {
      Alert.alert(
        'Tebrikler! 🏆',
        `"${book.title}" kitabını bitirdin! Kitaplıkta kalsın mı yoksa kalabalık etmesin diye kaldıralım mı?`,
        [
          { 
            text: 'Kütüphanede Kalsın', 
            onPress: () => {
              markAsFinished(book.id);
              Alert.alert('Harika!', 'Kitap "Bitti" olarak işaretlendi.');
            }
          },
          { 
            text: 'Kitaplığımdan Kaldır', 
            style: 'destructive',
            onPress: () => {
              markAsFinished(book.id);
              removeBook(book.id);
              navigation.goBack();
              Alert.alert('Tamamdır!', 'Kitap kütüphanenden kaldırıldı ama geçmişinde saklanacak.');
            }
          },
          { text: 'Vazgeç', style: 'cancel' }
        ]
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={theme.text} size={28} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleSpeech} style={[styles.backButton, { marginRight: 10 }]}>
              <Volume2 color={isSpeaking ? theme.primary : theme.text} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLibrary} style={[styles.backButton, { marginRight: 10 }]}>
              {isSavedLocally ? <BookmarkCheck color={theme.primary} size={24} /> : <BookmarkPlus color={theme.text} size={24} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.backButton}>
              <Share2 color={theme.text} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.coverSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={(isSavedLocally && localBook.cover) ? { uri: localBook.cover } : (book.cover ? { uri: book.cover } : require('../../assets/adaptive-icon.png'))} 
              style={styles.image} 
              resizeMode="cover" 
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search', { initialQuery: book.author })} activeOpacity={0.7}>
            <Text style={[styles.author, { color: theme.primary, textDecorationLine: 'underline' }]}>
              {book.author}
            </Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star color={theme.primary} size={20} />
              <Text style={styles.statText}>4.5</Text>
            </View>
            <View style={styles.stat}>
              <FileText color={theme.primary} size={20} />
              <Text style={styles.statText}>~{estimatedPages} Syf</Text>
            </View>
            <View style={styles.stat}>
              <Globe color={theme.primary} size={20} />
              <Text style={styles.statText}>{book.language || 'EN'}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Açıklama</Text>
          <Text style={styles.description}>
            Muazzam bir edebi veya akademik nitelik taşıyan bu eserin Gutenberg ve OpenLibrary veritabanından dijital kopyası bulunmaktadır. Kütüphane uygulamamız üzerinden "Okumaya Başla" butonuna tıklayarak saniyeler içerisinde erişebilirsiniz!
          </Text>

          {isSavedLocally && (
            <View style={styles.journalSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionHeader}>Okuma Günlüğü & Notlar</Text>
                <TouchableOpacity onPress={handlePickCover} style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <ImageIcon color={theme.primary} size={18} style={{ marginRight: 4 }}/>
                   <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>Kapak Seç</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(star => (
                   <TouchableOpacity key={star} onPress={() => { setRating(star); if(isSavedLocally) updateBookNotes(book.id, star, notes); }}>
                    <Star color={star <= rating ? theme.primary : theme.border} fill={star <= rating ? theme.primary : 'transparent'} size={32} style={{ marginRight: 8 }} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.finishBtn, { borderColor: localBook?.isFinished ? '#22C55E' : theme.border }]}
                onPress={handleFinishBook}
              >
                <CheckCircle color={localBook?.isFinished ? '#22C55E' : theme.textSecondary} size={20} style={{ marginRight: 8 }} />
                <Text style={[styles.finishBtnText, { color: localBook?.isFinished ? '#22C55E' : theme.textSecondary }]}>
                  {localBook?.isFinished ? 'Kitabı Bitirdin! 🏆' : 'Kitabı Bitirdiğinde Buraya Bas'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.notesInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                placeholder="Bu kitap hakkında ne düşünüyorsunuz? Notlarınızı buraya yazın..."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={notes}
                onChangeText={(txt) => { setNotes(txt); if(isSavedLocally) updateBookNotes(book.id, rating, txt); }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.readButtonWrapper}
          onPress={() => navigation.navigate('Reader', { book })}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.readButton} start={{x:0, y:0}} end={{x:1,y:1}}>
            <BookOpen color={theme.surface} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.readButtonText}>Okumaya Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  coverSection: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  imageContainer: {
    width: 180,
    height: 260,
    borderRadius: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
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
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.surface,
  },
  infoSection: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SIZES.xl,
    flex: 1,
    minHeight: 400,
    ...SHADOWS.small,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SIZES.xs,
  },
  author: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: SIZES.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SIZES.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.md,
    backgroundColor: theme.background,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.md,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.text,
    marginLeft: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  footer: {
    padding: SIZES.lg,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  readButtonWrapper: {
    borderRadius: SIZES.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
  },
  readButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.surface,
  },
  journalSection: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: SIZES.md,
    borderStyle: 'dashed',
    marginBottom: SIZES.md,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
