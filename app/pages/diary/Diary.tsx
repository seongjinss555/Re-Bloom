import { useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import NavBar from "../../../layout/NavBar";

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

    // 오늘 날짜를 "월 일, 요일" 형식으로 포맷팅
    const todayDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(new Date());
    } catch {
      const d = new Date();
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    }
  }, []);

  const submitDiary = selectedMood !== null && diaryText.trim().length > 0;

  const handleAskAI = async () => {
    if (!submitDiary) return;

    try {
      // TODO: 필요 시 서버에 저장/요청
      // await api.post('/api/diary', { date: new Date().toISOString(), mood, content });

      // TODO: AI 상담 라우팅/요청
      // await api.post('/api/diary/coach', { mood, content });

      Alert.alert('전송 완료', 'AI 상담을 시작합니다.');
      // router.push('/pages/Coach');  // expo-router 사용 시
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '알 수 없는 오류가 발생했어요.');
    }
  };
  
return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F6FAFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 상단: 날짜 */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{todayDate}</Text>
          <Text style={styles.title}>오늘 하루는 어땠나요?</Text>
        </View>

        {/* 감정 선택 */}
        <View style={styles.moodWrap}>
          {MOODS.map((m) => {
            const selected = selectedMood === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setSelectedMood(m.key)}
                style={[styles.moodItem, selected && styles.moodItemSelected]}
                android_ripple={{ color: '#E5F0FF' }}
              >
                <Text style={[styles.moodEmoji, selected && styles.moodEmojiSelected]}>
                  {m.emoji}
                </Text>
                <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 일기 입력 */}
        <View style={styles.editor}>
          <Text style={styles.editorLabel}>오늘의 기록</Text>
          <TextInput
            style={styles.textInput}
            placeholder="마음에 남는 순간, 생각, 감정을 자유롭게 적어주세요."
            placeholderTextColor="#98A2B3"
            multiline
            textAlignVertical="top"
            value={diaryText}
            onChangeText={setDiaryText}
            maxLength={5000}
            returnKeyType="default"
          />
          <Text style={styles.counter}>{diaryText.length} / 5000</Text>
        </View>

        {/* 하단 버튼 */}
        <Pressable
          onPress={handleAskAI}
          disabled={!submitDiary}
          style={({ pressed }) => [
            styles.ctaBtn,
            !submitDiary && styles.ctaBtnDisabled,
            pressed && submitDiary && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.ctaText}>AI와 상담하기</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
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
    color: '#101828',
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
    backgroundColor: '#EEF4FF',
  },
  moodEmoji: {
    fontSize: 22,
    textAlign: 'center',
  },
  moodEmojiSelected: {
    transform: [{ scale: 1.05 }],
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
});

