import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, Modal, Animated, TextInput, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SIZES, SHADOWS } from '../utils/theme';
import { ArrowLeft, Download, Check, Settings2, Clock, Sun, Moon, Coffee, Music, Play, Pause, Quote, Eye, Search, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { useProfileStore } from '../store/profileStore';
import { useQuoteStore } from '../store/quoteStore';
import { useLibraryStore } from '../store/libraryStore';
let Audio;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  Audio = { Sound: { createAsync: () => ({ sound: { unloadAsync: () => {}, stopAsync: () => {}, playAsync: () => {}, pauseAsync: () => {} } }) } };
}

// Static mapping for local assets (Requires files to exist in assets/books/ to work)
const LOCAL_ASSETS = {
  // 'tr-sii1': require('../../assets/books/safahat.pdf'),
  // 'tr-tar1': require('../../assets/books/nutuk.pdf'),
  // 'tr-rom1': require('../../assets/books/calikusu.pdf'),
  // 'tr-rom2': require('../../assets/books/askimemnu.pdf'),
  // 'tr-rom3': require('../../assets/books/maivesiyah.pdf'),
  // 'tr-rom4': require('../../assets/books/arabasevdasi.pdf'),
  // 'tr-kla1': require('../../assets/books/sucveceza.pdf'),
  // 'tr-kla2': require('../../assets/books/sefiller.pdf'),
};

export default function ReaderScreen({ route, navigation }) {
  const { theme } = useThemeStore();
  const { markAsFinished, removeBook, updateProgress } = useLibraryStore();
  const styles = getStyles(theme);

  const { book } = route.params;
  const [downloading, setDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localUri, setLocalUri] = useState(null);

  const [readerTheme, setReaderTheme] = useState(theme.isDark ? 'dark' : 'light');
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAmbience, setShowAmbience] = useState(false);
  const [pomodoro, setPomodoro] = useState({ active: false, seconds: 1500, mode: 'work' }); // 25 min = 1500s
  const [activeSound, setActiveSound] = useState(null);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [quoteModal, setQuoteModal] = useState(false);
  const [tempQuote, setTempQuote] = useState('');
  
  const [progress, setProgress] = useState(book.progress || 0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  const [lastMilestone, setLastMilestone] = useState(Math.floor((book.progress || 0) / 10) * 10);

  const addFocusTime = useProfileStore((state) => state.addFocusTime);
  const addQuote = useQuoteStore((state) => state.addQuote);

  const celebrationAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer;
    if (pomodoro.active && pomodoro.seconds > 0) {
      timer = setInterval(() => {
        setPomodoro(prev => ({ ...prev, seconds: prev.seconds - 1 }));
        if (pomodoro.mode === 'work') setFocusSeconds(f => f + 1);
      }, 1000);
    } else if (pomodoro.active && pomodoro.seconds === 0) {
      // Switch mode
      const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
      const nextSecs = nextMode === 'work' ? 1500 : 300;
      setPomodoro({ ...pomodoro, mode: nextMode, seconds: nextSecs });
    }
    return () => clearInterval(timer);
  }, [pomodoro.active, pomodoro.seconds]);

  useEffect(() => {
    return playbackInstance
      ? () => { playbackInstance.unloadAsync(); }
      : undefined;
  }, [playbackInstance]);

  const toggleSound = async (type) => {
    if (activeSound === type) {
      await playbackInstance.stopAsync();
      setActiveSound(null);
      return;
    }

    if (playbackInstance) {
      await playbackInstance.unloadAsync();
    }

    const soundUrls = {
      rain: 'https://www.soundjay.com/nature/rain-01.mp3',
      fire: 'https://www.soundjay.com/ambient/fireplace-1.mp3',
      cafe: 'https://www.soundjay.com/ambient/coffee-shop-1.mp3'
    };

    const { sound } = await Audio.Sound.createAsync(
      { uri: soundUrls[type] },
      { shouldPlay: true, isLooping: true, volume: 0.5 }
    );
    setPlaybackInstance(sound);
    setActiveSound(type);
  };

  const handleProgressChange = (newVal) => {
    const capped = Math.min(100, Math.max(0, newVal));
    setProgress(capped);
    
    const milestone = Math.floor(capped / 10) * 10;
    if (milestone > lastMilestone && milestone > 0) {
      triggerCelebration(milestone);
      setLastMilestone(milestone);
    }
  };

  const triggerCelebration = (milestone) => {
    const messages = {
      10: "Harika başladın! Yolun %10'u bitti bile! 🚀",
      20: "Mükemmel gidiyorsun! %20 tamamlandı! 📚",
      30: "Bilgelik yolunda %30 geride kaldı! ✨",
      40: "Odaklanma ustası! %40 bitti! 🔥",
      50: "Yolun yarısı! Tebrikler, %50! 👑",
      60: "Artık durdurulamazsın! %60! 📈",
      70: "Kitabın ruhuna dokunuyorsun! %70! 🧘‍♂️",
      80: "Büyük başarı! %80 tamam! 🏆",
      90: "Neredeyse bitti! %90! Şampiyon geliyooor! 🎆",
      100: "MUHTEŞEM! Kitabı bitirdin! Yeni bir rütbe seni bekliyor! 🤴💎"
    };

    setCelebrationText(messages[milestone] || "Muazzam İlerleme! 🎉");
    setShowCelebration(true);
    
    celebrationAnim.setValue(0);
    Animated.spring(celebrationAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();

    setTimeout(() => {
        Animated.timing(celebrationAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start(() => setShowCelebration(false));
    }, 3000);
  };

  const handleGoBack = () => {
    // Save current progress and focus time
    updateProgress(book.id, progress);
    if (focusSeconds > 0) {
      addFocusTime(focusSeconds);
    }
    navigation.goBack();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}d ${s}s`;
  };

  const getReaderFilter = () => {
    if (readerTheme === 'dark') return 'invert(1) hue-rotate(180deg)';
    if (readerTheme === 'sepia') return 'sepia(80%)';
    return 'none';
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const sanitizedName = book.title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileUri = `${FileSystem.cacheDirectory}${sanitizedName}.pdf`;
      const { uri } = await FileSystem.downloadAsync(book.downloadUrl, fileUri);
      
      setLocalUri(uri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Kitabı Cihaza Kaydet',
        });
      }
      setIsDownloaded(true);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const [bookUrl, setBookUrl] = useState(book.downloadUrl || null);
  const [searching, setSearching] = useState(!book.downloadUrl);

  // Auto-search Gutendex for books without a URL
  useEffect(() => {
    if (book.downloadUrl) return;
    
    const autoSearch = async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(book.title)}`);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          const found = data.results[0];
          const htmlUrl = found.formats['text/html'] || found.formats['text/html; charset=utf-8'];
          const pdfUrl = found.formats['application/pdf'];
          const url = htmlUrl || pdfUrl || null;
          
          if (url) {
            setBookUrl(url);
            // Save for next time
            useLibraryStore.getState().addBook({ ...book, downloadUrl: url });
          }
        }
      } catch (e) {
        console.log('Auto-search failed:', e);
      }
      setSearching(false);
    };
    
    autoSearch();
  }, []);

  // Resolve the book URI (Local Asset or Remote URL)
  const getBookUri = () => {
    // 1. Check for manual imported file
    if (book.uri) return book.uri;

    // 2. Check for "Gömülü" (Local) Asset
    if (LOCAL_ASSETS[book.id]) {
      const asset = Asset.fromModule(LOCAL_ASSETS[book.id]);
      if (asset.localUri || asset.uri) {
        return asset.localUri || asset.uri;
      }
    }

    // 3. Fallback to remote URL
    const url = localUri || bookUrl;
    if (!url) return null;

    // Wikisource or other HTML content shouldn't use Google Docs Viewer
    const isHtml = url.includes('wikisource.org') || url.includes('gutenberg.org');
    if (isHtml) return url;

    return Platform.OS === 'android' 
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` 
      : url;
  };

  const resolvedUri = getBookUri();
  const hasContent = resolvedUri && resolvedUri.length > 0;

  const wikisourceInjectedJS = `
    (function() {
      const hideElements = [
        '.header-container',
        '.pre-content',
        '.footer',
        '#mw-mf-page-left',
        '#mw-mf-page-center .header',
        '.minerva-header',
        '.page-actions-menu',
        '.post-content'
      ];
      hideElements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
      });
      document.body.style.paddingTop = '0';
      document.body.style.backgroundColor = 'transparent';
    })();
    true;
  `;

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(`${book.title} ${book.author} pdf oku`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  const handleFinishBook = () => {
    Alert.alert(
      'Tebrikler! 🏆',
      `"${book.title}" kitabını bitirdin! Kütüphanende kalsın mı yoksa silinsin mi?`,
      [
        { 
          text: 'Kütüphanede Kalsın', 
          onPress: () => {
            markAsFinished(book.id);
            Alert.alert('Harika!', 'Kitap "Bitti" olarak işaretlendi.');
          }
        },
        { 
          text: 'Tamamen Sil (Geçmişe Kaydet)', 
          style: 'destructive',
          onPress: () => {
            markAsFinished(book.id);
            removeBook(book.id);
            navigation.goBack();
            Alert.alert('Silindi', 'Kitap kütüphanenden kaldırıldı ama okuma geçmişinde saklanacak.');
          }
        },
        { text: 'Vazgeç', style: 'cancel' }
      ]
    );
  };

  const renderError = () => (
    <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
      <Text style={[styles.errorTitle, { color: theme.text }]}>Kitap Yüklenemedi</Text>
      <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>
        Bu kitabın sunucusu şu an yanıt vermiyor olabilir. Alternatif bir kaynak bulmak için Google'da aratabilirsiniz.
      </Text>
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSearch}>
        <Text style={styles.googleBtnText}>Google'da Ara ve Oku</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWebViewer = () => {
    if (searching) {
      return (
        <View style={styles.noContentContainer}>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 20 }} />
          <Text style={[styles.noContentTitle, { color: theme.text }]}>"{book.title}" aranıyor...</Text>
          <Text style={[styles.noContentAuthor, { color: theme.textSecondary }]}>Gutendex kütüphanesinde eşleşme kontrol ediliyor</Text>
        </View>
      );
    }

    if (!hasContent) {
      return (
        <View style={styles.noContentContainer}>
          <View style={[styles.bigInitial, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.bigInitialText, { color: theme.primary }]}>{book.title.charAt(0)}</Text>
          </View>
          <Text style={[styles.noContentTitle, { color: theme.text }]}>{book.title}</Text>
          <Text style={[styles.noContentAuthor, { color: theme.textSecondary }]}>{book.author}</Text>
          <Text style={[styles.noContentDesc, { color: theme.textSecondary }]}>
            Bu kitabın PDF'i Gutendex'te bulunamadı.{'\n'}Arama ekranından manuel olarak arayabilirsiniz.
          </Text>
          <TouchableOpacity 
            style={[styles.searchOnlineBtn, { backgroundColor: theme.primary }]}
            onPress={() => { navigation.goBack(); navigation.navigate('Search', { initialQuery: book.title }); }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>🔍 Manuel Ara</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe 
          src={book.downloadUrl} 
          width="100%" 
          height="100%" 
          style={{ 
            border: 'none',
            backgroundColor: '#ffffff',
            filter: getReaderFilter()
          }} 
        />
      );
    }
    return (
      <WebView 
        source={{ uri: resolvedUri }}
        style={[styles.webview, { backgroundColor: '#ffffff' }]}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
        renderError={renderError}
        injectedJavaScript={resolvedUri?.includes('wikisource.org') ? wikisourceInjectedJS : ''}
        scalesPageToFit={true}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.iconButton}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
          <View style={styles.timerRow}>
            <Clock color={theme.primary} size={12} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 'bold' }}>
              Odak Modu: {formatTime(focusSeconds)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleFinishBook} style={styles.iconButton}>
            <CheckCircle color={book.isFinished ? theme.secondary : theme.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoogleSearch} style={styles.iconButton}>
            <Search color={theme.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setQuoteModal(true)} style={styles.iconButton}>
            <Quote color={theme.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAmbience(!showAmbience)} style={styles.iconButton}>
            <Music color={activeSound ? theme.primary : theme.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.iconButton}>
            <Settings2 color={theme.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} disabled={downloading || isDownloaded} style={styles.iconButton}>
            {downloading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : isDownloaded ? (
              <Check color={theme.secondary} size={22} />
            ) : (
              <Download color={theme.text} size={22} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showAmbience && (
        <View style={styles.ambienceBar}>
          <TouchableOpacity 
            style={[styles.ambienceBtn, activeSound === 'rain' && { backgroundColor: theme.primary + '30' }]} 
            onPress={() => toggleSound('rain')}
          >
            <Text style={{ color: activeSound === 'rain' ? theme.primary : theme.text }}>🌧️ Yağmur</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.ambienceBtn, activeSound === 'fire' && { backgroundColor: theme.primary + '30' }]} 
            onPress={() => toggleSound('fire')}
          >
            <Text style={{ color: activeSound === 'fire' ? theme.primary : theme.text }}>🔥 Şömine</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.ambienceBtn, activeSound === 'cafe' && { backgroundColor: theme.primary + '30' }]} 
            onPress={() => toggleSound('cafe')}
          >
            <Text style={{ color: activeSound === 'cafe' ? theme.primary : theme.text }}>☕ Kafe</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSettings && (
        <View style={styles.readerSettingsBar}>
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.settingsTitle}>Pomodoro Asistanı (25/5)</Text>
            <View style={styles.pomoControl}>
               <Text style={[styles.pomoTimer, { color: theme.text }]}>
                 {Math.floor(pomodoro.seconds / 60)}:{String(pomodoro.seconds % 60).padStart(2, '0')}
               </Text>
               <TouchableOpacity 
                  onPress={() => setPomodoro({...pomodoro, active: !pomodoro.active})}
                  style={[styles.pomoBtn, { backgroundColor: pomodoro.active ? '#EF4444' : '#10B981' }]}
               >
                 {pomodoro.active ? <Pause color="#FFF" size={16} /> : <Play color="#FFF" size={16} />}
                 <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 6 }}>
                   {pomodoro.active ? 'Durdur' : 'Odaklan'}
                 </Text>
               </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.settingsTitle}>Okuma Filtresi</Text>
          <View style={styles.themeOptionsRow}>
            <TouchableOpacity onPress={() => setReaderTheme('light')} style={[styles.themeOptionBtn, { backgroundColor: '#FFFFFF', borderColor: readerTheme === 'light' ? theme.primary : '#E5E5E5' }]}>
              <Sun color="#1a1a1a" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReaderTheme('sepia')} style={[styles.themeOptionBtn, { backgroundColor: '#F4EAD5', borderColor: readerTheme === 'sepia' ? theme.primary : '#E5E5E5' }]}>
              <Coffee color="#5C4B3C" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReaderTheme('dark')} style={[styles.themeOptionBtn, { backgroundColor: '#1A1A1A', borderColor: readerTheme === 'dark' ? theme.primary : '#333' }]}>
              <Moon color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}

          <View style={styles.webViewContainer}>
        {renderWebViewer()}
      </View>

      <View style={styles.progressControlBar}>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>Okuma İlerlemesi: %{progress}</Text>
        <View style={styles.progressSliderRow}>
          <TouchableOpacity onPress={() => handleProgressChange(progress - 5)} style={styles.progBtn}>
             <Text style={{ color: theme.primary }}>-5%</Text>
          </TouchableOpacity>
          <View style={[styles.mainProgressBarBg, { backgroundColor: theme.border }]}>
             <View style={[styles.mainProgressBarFill, { width: `${progress}%`, backgroundColor: theme.secondary }]} />
          </View>
          <TouchableOpacity onPress={() => handleProgressChange(progress + 5)} style={styles.progBtn}>
             <Text style={{ color: theme.secondary }}>+5%</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Break Time Overlay */}
      {pomodoro.mode === 'break' && pomodoro.active && (
        <View style={styles.breakOverlay}>
           <Eye color={theme.secondary} size={64} style={{ marginBottom: 20 }} />
           <Text style={styles.breakTitle}>Göz Dinlendirme Saati</Text>
           <Text style={styles.breakSubtitle}>Harika odaklandın! Şimdi 5 dakika boyunca ekrana bakma, bir bardak su iç ve uzaklara bak.</Text>
           <Text style={styles.breakTimer}>{Math.floor(pomodoro.seconds / 60)}:{String(pomodoro.seconds % 60).padStart(2, '0')}</Text>
        </View>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View 
            style={[
                styles.celebrationOverlay, 
                { 
                    opacity: celebrationAnim,
                    transform: [{ scale: celebrationAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                }
            ]}
        >
            <View style={[styles.celebrationBox, { backgroundColor: theme.surface }]}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={[styles.celebrationMsg, { color: theme.text }]}>{celebrationText}</Text>
            </View>
        </Animated.View>
      )}

      {/* Manual Quote Modal */}
      <Modal visible={quoteModal} transparent animationType="fade">
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
               <Text style={[styles.label, { color: theme.text }]}>Alıntı Kaydet</Text>
               <TextInput 
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  multiline
                  placeholder="Bu kitaptan efsane bir cümle..."
                  placeholderTextColor={theme.textSecondary}
                  value={tempQuote}
                  onChangeText={setTempQuote}
               />
               <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setQuoteModal(false)} style={styles.modalBtn}>
                     <Text style={{ color: theme.textSecondary }}>Vazgeç</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                        addQuote(tempQuote, book.author, book.title);
                        setTempQuote('');
                        setQuoteModal(false);
                    }} 
                    style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  >
                     <Text style={{ color: theme.surface, fontWeight: 'bold' }}>Kaydet</Text>
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
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  iconButton: {
    padding: SIZES.xs,
    marginLeft: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: SIZES.sm,
    color: theme.text,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  readerSettingsBar: {
    padding: SIZES.lg,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  ambienceBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.md,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  ambienceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pomoControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 12,
  },
  pomoTimer: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pomoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  settingsTitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: SIZES.sm,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  themeOptionBtn: {
    padding: SIZES.sm,
    borderRadius: 8,
    borderWidth: 2,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  googleBtn: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 4,
  },
  googleBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  breakOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    zIndex: 1000,
  },
  breakTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breakSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  breakTimer: {
    color: theme.secondary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  progressControlBar: {
    padding: SIZES.md,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  progressSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  mainProgressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mainProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  celebrationBox: {
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    margin: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  celebrationMsg: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.background,
  },
  bigInitial: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bigInitialText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  noContentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  noContentAuthor: {
    fontSize: 16,
    marginBottom: 20,
  },
  noContentDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  searchOnlineBtn: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    ...SHADOWS.medium,
  },
});
