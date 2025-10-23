import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../config/api';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AIChat() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 라우터로 받기
  const { diaryId: pDiaryId, firstRes, mood: pMood } =
    useLocalSearchParams<{ diaryId?: string; firstRes?: string; mood?: string }>();

  const initialId = useMemo(() => (pDiaryId ? Number(pDiaryId) : null), [pDiaryId]);

  const [diaryId, setDiaryId] = useState<number | null>(initialId);
  const [mood, setMood] = useState<string | null>(typeof pMood === 'string' ? pMood : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const flatRef = useRef<FlatList<Message>>(null);

  // 첫 멘트/아이디 세팅
  useEffect(() => {
  (async () => {
    const decodedFirstRes =
      typeof firstRes === 'string'
        ? (() => {
            try { return decodeURIComponent(firstRes); } catch { return firstRes; }
          })()
        : undefined;

    if (decodedFirstRes) {
      setMessages([{ role: 'assistant', content: decodedFirstRes }]);
    }

    if (!initialId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await api.post('/api/diary/chat/start', null, {
          params: { date: today },
        });
        if (typeof data?.diaryId === 'number') setDiaryId(data.diaryId);
        if (data?.mood) setMood(data.mood);
        // firstRes가 없을 때만 서버 오프닝 사용
        if (!decodedFirstRes && data?.message) {
          setMessages([{ role: 'assistant', content: data.message }]);
        }
      } catch (e: any) {
        console.log('start chat error', e?.response?.data ?? e?.message);
      }
    }
  })();
}, [firstRes, initialId]);

const goHome = () => {
    router.push('/pages/Home');
}

  // 전송: 응답은 항상 data.message 사용
  const onSend = async () => {
    const text = input.trim();
    if (!text || loading || !diaryId) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await api.post(
        `/api/diary/chat/${diaryId}`,
        { message: text },                         
        { headers: { 'Content-Type': 'application/json' } }
      );

      const assistant: string = data?.message ?? ''; 
      if (assistant) {
        setMessages(p => [...p, { role: 'assistant', content: assistant }]);
      }
      flatRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      console.log('send error', e?.response?.data ?? e?.message);
    } finally {
      setLoading(false);
    }
  };

  // 요약 저장
  const onMakeSummary = async () => {
    if (!diaryId || saving) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/api/diary/chat/${diaryId}/summary`);
      alert('요약이 저장되었어요.\n\n' + (data?.summary ?? ''));
    } catch (e: any) {
      console.log('summary error', e?.response?.data ?? e?.message);
    } finally {
      setSaving(false);
    }
  };

  const TypingBubble = () => (
    <View style={[styles.row, styles.left]}>
      <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
        <Text style={[styles.bubbleText, styles.botText]}>생각 중…</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.right : styles.left]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

const canSend = (text: string, loading: boolean, diaryId?: number | null) =>
!!text.trim() && !loading && !!diaryId;

// 엔터 키 처리
const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
  if (Platform.OS === 'web') {
    // @ts-ignore react-native-web: shiftKey 존재
    const shift = e?.nativeEvent?.shiftKey;
    const key = e.nativeEvent.key;
    if (key === 'Enter' && !shift) {
      e.preventDefault?.();
      if (canSend(input, loading, diaryId)) onSend();
    }
  }
};

// 앱용 엔터 처리
const handleChangeText = (t: string) => {
  // 엔터로 끝나면 전송
  if (t.endsWith('\n')) {
    const trimmed = t.replace(/\n+$/g, ''); 
    const payload = (input + trimmed).trim();
    if (canSend(payload, loading, diaryId)) {
      setInput(payload);
      setTimeout(() => onSend(), 0);
    } else {
      setInput(payload);
    }
  } else {
    setInput(t);
  }
};

return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={goHome} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>오늘의 상담</Text>
        <Pressable
            onPress={onMakeSummary}
            disabled={!diaryId || saving}
            style={[styles.headerBtn, (!diaryId || saving) && styles.headerBtnDisabled]}
          >
            {saving ? <ActivityIndicator /> : <Text style={styles.headerBtnText}>오늘의 요약</Text>}
        </Pressable>
        
      </View>

      {/* 채팅 */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 12 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? <TypingBubble /> : null}
      />

      {/* 입력 바 */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#98A2B3"
          multiline
          value={input}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          editable={!loading && !!diaryId}
        />
        <Pressable
          onPress={onSend}
          disabled={loading || !input.trim() || !diaryId}
          style={[styles.sendBtn, (loading || !input.trim() || !diaryId) && styles.sendBtnDisabled]}
        >
          <Text style={styles.sendBtnText}>전송</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const BG = '#F7F8FC';
const PRIMARY = '#6B63FF';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG 
},
  header: {
    height: 52, 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderColor: '#E5E7EB', 
    backgroundColor: '#FFF',
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#0B1220', 
    fontSize: 16, 
    fontWeight: '700' 
},
  headerBtn: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    backgroundColor: '#F3F4F6' 
},
  headerBtnText: { 
    color: '#374151', 
    fontWeight: '700', 
    fontSize: 12 
},
  headerBtnDisabled: { opacity: 0.5 },
  moodPill: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 999 
},
  moodPillText: { 
    color: PRIMARY, 
    fontWeight: '700', 
    fontSize: 12 
},

  list: { flex: 1 },
  row: { 
    flexDirection: 'row', 
    marginTop: 8 
},
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },

  bubble: { 
    maxWidth: '80%', 
    borderRadius: 14, 
    paddingVertical: 10, 
    paddingHorizontal: 12 
},
  userBubble: { backgroundColor: PRIMARY },
  botBubble: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
},
  userText: { color: '#FFFFFF' },
  botText: { color: '#0B1220' },
  bubbleText: { 
    fontSize: 15, 
    lineHeight: 20 
},
  typingBubble: { opacity: 0.9 },

  inputBar: {
    flexDirection: 'row', 
    gap: 8, 
    paddingHorizontal: 12, 
    paddingTop: 10, 
    paddingBottom: 8,
    borderTopWidth: 1, 
    borderColor: '#E5E7EB', 
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1, 
    minHeight: 40, 
    maxHeight: 120, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    color: '#0B1220',
  },
  sendBtn: { 
    alignSelf: 'flex-end', 
    backgroundColor: PRIMARY, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 10 
},
  sendBtnDisabled: { backgroundColor: '#C7D2FE' },
  sendBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '700' 
},
});
