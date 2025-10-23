import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import NavBar from "../../../components/layout/NavBar";
import api from "../../config/api";

type todayMood = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';

const MOODS: { key: todayMood; label: string, emoji: string}[] = [
    { key: 'very_happy', label: '매우 행복', emoji: '😁' },
    { key: 'happy', label: '행복', emoji: '😊' },
    { key: 'neutral', label: '보통', emoji: '😐' },
    { key: 'sad', label: '슬픔', emoji: '😢' },
    { key: 'very_sad', label: '매우 슬픔', emoji: '😭' },
];

export default function DiaryScreen(){
  const [selectedMood, setSelectedMood] = useState<todayMood | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);   
  const [alreadyToday, setAlreadyToday] = useState(false);                 

  const todayDate = useMemo(() => {
    try { return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(new Date()); }
    catch { const d = new Date(); return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`; }
  }, []);

  const submitDiary = selectedMood !== null && diaryText.trim().length > 0 && !submitting && !alreadyToday;

  useEffect(() => {
    const loadToday = async () => {
      setErrorMessage(null);
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data } = await api.get('/api/diary', { params: { date: today } });
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        setAlreadyToday(list.length > 0);
        if (list.length > 0) setErrorMessage('이미 오늘 일기를 작성하셨습니다. 하루에 하나의 일기만 작성할 수 있습니다.');
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? '오늘 일기 조회 실패';
        console.log('[Diary] 오늘 일기 조회 실패', msg);
      }
    };
    loadToday();
  }, []);

  const handleAskAI = async () => {
   if (!submitDiary) return;
  setSubmitting(true);
  setErrorMessage(null);

  try {
    const today = new Date().toISOString().split('T')[0];

    // 일기 저장 +첫 응답까지 반환
    const { data } = await api.post('/api/diary/save-and-chat', {
      date: today,
      mood: selectedMood,
      content: diaryText,
    }, { headers: { 'Content-Type': 'application/json' } });

    // save-and-chat이 바로 {diaryId, message, mood}를 주면 그걸로 이동
    if (data?.diaryId && typeof data?.message === 'string') {
      router.push({
        pathname: '/pages/diary/AIChat',
        params: {
          diaryId: String(data.diaryId),
          firstRes: encodeURIComponent(data.message),   
          mood: data.mood ?? '',    
        },
      });
      return;
    }

    // 폴백: start 호출해서 오프닝/diaryId 확보
    const { data: start } = await api.post('/api/diary/chat/start', null, {
      params: { date: today },
    });
    router.push({
      pathname: '/pages/diary/AIChat',
      params: {
        diaryId: String(start.diaryId),
        firstRes: encodeURIComponent(data.message),
        mood: start.mood ?? '',
      },
    });
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data?.message ?? e?.message ?? '요청 실패';
    setErrorMessage(msg);
    if (status === 400) setAlreadyToday(true);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F6FAFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#599fe1ff', '#FFD3F0']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.dateText}>{todayDate}</Text>
            <Text style={styles.title}>오늘 하루는 어땠나요?</Text>
          </View>
          <View style={styles.moodWrap}> 
            {MOODS.map((m) => { 
              const selected = selectedMood === m.key; 
              return ( 
              <Pressable 
              key={m.key} 
              onPress={() => !alreadyToday && setSelectedMood(m.key)} 
              style={[styles.moodItem, selected && styles.moodItemSelected]} 
              android_ripple={{ color: '#E5F0FF' }} > 
              <Text style={[
                styles.moodEmoji, 
                selected && styles.moodEmojiSelected,
                alreadyToday && { opacity: 0.5 }]}> 
                {m.emoji} 
              </Text> 
              <Text style={[
                styles.moodLabel, 
                selected && styles.moodLabelSelected]}> 
                {m.label} 
              </Text> 
              </Pressable> ); 
            })} 
            </View>
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          <View style={styles.editor}>
            <Text style={styles.editorLabel}>오늘의 기록</Text>
            <TextInput
              style={styles.textInput}
              placeholder="마음에 남는 순간, 생각, 감정을 자유롭게 적어주세요."
              placeholderTextColor="#98A2B3"
              multiline
              textAlignVertical="top"
              value={diaryText}
              onChangeText={(t) => { setErrorMessage(null); setDiaryText(t); }} 
              maxLength={5000}
              returnKeyType="default"
              editable={!alreadyToday} 
            />
            <Text style={styles.counter}>{diaryText.length} / 5000</Text>
          </View>

          <Pressable
            onPress={handleAskAI}
            disabled={!submitDiary}
            style={({ pressed }) => [
              styles.ctaBtn,
              (!submitDiary) && styles.ctaBtnDisabled,
              pressed && submitDiary && { opacity: 0.85 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {alreadyToday ? '오늘은 이미 작성했어요' : 'AI와 상담하기'}
              </Text>
            )}
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </LinearGradient>
      <NavBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  header: {
    marginBottom: 18,
  },
  dateText: {
    fontSize: 16,
    color: '#475467',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffffff',
  },
  moodWrap: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 20,
  },
  moodItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodItemSelected: {
    borderColor: '#5B8DEF',
    backgroundColor: '#d8e1f0ff',
    borderWidth:2,
  },
  moodEmoji: {
    fontSize: 22,
    textAlign: 'center',
  },
  moodEmojiSelected: {
    transform: [{ scale: 1.2 }],
  },
  moodLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#475467',
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: '#24406A',
  },
  editor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  editorLabel: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '700',
    marginBottom: 10,
  },
  textInput: {
    minHeight: 160,
    maxHeight: 320,
    fontSize: 16,
    color: '#0B1220',
    lineHeight: 22,
  },
  counter: {
    marginTop: 6,
    fontSize: 12,
    color: '#98A2B3',
    textAlign: 'right',
  },
  ctaBtn: {
    marginTop: 18,
    backgroundColor: '#6E59FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E59FF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaBtnDisabled: {
    backgroundColor: '#C7D2FE',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});

