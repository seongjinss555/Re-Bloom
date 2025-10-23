import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Header from "../../components/layout/Header";
import NavBar from "../../components/layout/NavBar";
import QuestContainer from "../../constants/QuestContainer";
import RotatingText from "../../constants/RotatingText";
import api from "../config/api";

const { width: screenWidth } = Dimensions.get("window");

type Diary = {
  id: number;
  diaryDate: string | { year:number; month:number; day:number }; 
  mood: string;    
  content: string;
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
};

const MOOD_EMOJI: Record<string, string> = {
  very_happy: "😁",
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  very_sad: "😭",
};

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [allDiaries, setAllDiaries] = useState<Diary[]>([]);
  const [byDate, setByDate] = useState<Record<string, Diary[]>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, delay: 1200, useNativeDriver: true }).start();
  }, []);

  // 전체 일기 로드 → 달력 dot/빠른 캐시 
  const fetchAll = async () => {
  try {
    setLoadingAll(true);
    const res = await api.get("/api/diary/all");
    const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    setAllDiaries(list);

    const grouped: Record<string, any[]> = {};
    list.forEach((it) => {
      const dateStr = typeof it.diaryDate === "string"
        ? it.diaryDate
        : `${it.diaryDate.year}-${String(it.diaryDate.month).padStart(2,"0")}-${String(it.diaryDate.day).padStart(2,"0")}`;
      const k = dateStr;
      if (!Array.isArray(grouped[k])) grouped[k] = [];
      grouped[k].push(it);
    });
    setByDate(grouped);
  } catch (e: any) {
    console.error("[ALL DIARIES ERROR]", e?.response?.data ?? e?.message);
    Alert.alert("오류", e?.response?.data?.message ?? "모든 일기 조회에 실패했어요.");
  } finally {
    setLoadingAll(false);
  }
};

  useEffect(() => { fetchAll(); }, []);

  // 특정 날짜 일기 로드
  const fetchByDate = async (date: string) => {
  try {
    setLoadingDate(true);
    const res = await api.get(`/api/diary`, { params: { date } });
    const arr = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    setByDate((prev) => ({ ...prev, [date]: arr }));
  } catch (e: any) {
    console.error("[DIARY BY DATE ERROR]", e?.response?.data ?? e?.message);
    Alert.alert("오류", e?.response?.data?.message ?? "해당 날짜의 일기 조회에 실패했어요.");
  } finally {
    setLoadingDate(false);
  }
};

const fetchDiarySummary = async (id:number) =>{
    try{
        const res = await api.post(`/api/diary/chat/${id}/summary`);
        const s = typeof res.data === 'string' ? res.data : (res.data?.summary ?? '');
        return s;
    }catch(e:any){
        console.log('[요약 불러오기 에러]', e?.response?.data ?? e?.message);
        return '';
    }
};

// 선택한 날짜의 일기들 중 summary가 비어 있으면 채워넣기
const ensureSummariesForDate = async (dateStr: string) => {
  const items = byDate[dateStr] ?? [];
  if (!items.length) return;

  const targets = items.filter(d => !d.summary);
  if (!targets.length) return;

  // 요약들 요청
  const results = await Promise.all(
    targets.map(async (d) => ({
      id: d.id,
      summary: await fetchDiarySummary(d.id),
    }))
  );

  // 상태 머지
  setByDate(prev => {
    const next = { ...prev };
    next[dateStr] = (next[dateStr] ?? []).map(d => {
      const found = results.find(r => r.id === d.id && r.summary);
      return found ? { ...d, summary: found.summary } : d;
    });
    return next;
  });
};

  // 달력 점/선택 표시 
  const markedDates = useMemo(() => {
    const dots: Record<string, any> = {};
    Object.keys(byDate).forEach((d) => {
      const has = (byDate[d] ?? []).length > 0;
      if (has) {
        dots[d] = { marked: true, dotColor: "#599fe1ff" };
      }
    });
    if (selectedDate) {
      dots[selectedDate] = {
        ...(dots[selectedDate] ?? {}),
        selected: true,
        selectedColor: "#599fe1ff",
      };
    }
    return dots;
  }, [byDate, selectedDate]);

  // 날짜 탭 → 캐시에 있으면 바로 모달, 없으면 API 후 모달 
  const onDayPress = async (day: DateData) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);
    if (!byDate[dateStr]) {
      await fetchByDate(dateStr);
    }
    await ensureSummariesForDate(dateStr);
    setModalVisible(true);
  };

  const goQuest = () => router.push("/pages/quest/Quest");

  return (
    <LinearGradient colors={["#599fe1ff", "#FFD3F0"]} style={styles.container}>
      <Header />

      <Calendar
        style={{ flex: 1, width: screenWidth - 80, marginBottom: 210, borderRadius: 5 }}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#599fe1ff",
          todayTextColor: "#ea1717ff",
          arrowColor: "#599fe1ff",
          monthTextColor: "#599fe1ff",
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 16,
          textSectionTitleColor: "#599fe1ff",
          textDisabledColor: "#d9e1e8",
          dotColor: "#599fe1ff",
          selectedDotColor: "#ffffff",
        }}
      />

      <QuestContainer
        onPress={goQuest}
        style={{
          width: screenWidth - 80,
          height: 140,
          borderRadius: 20,
          position: "absolute",
          bottom: 134,
        }}
      >
        <RotatingText
          texts={["오늘은", "산책하기!", "오늘은", "운동하기!", "오늘은", "명상하기!", "오늘은", "일기쓰기!"]}
          mainClassName="px-3 py-1 rounded-lg bg-transparent"
          splitLevelClassName="overflow-hidden pb-1 rt-word"
          elementLevelClassName="rt-element"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          staggerFrom="last"
          staggerDuration={0.03}
          transition={{ type: "spring", damping: 26, stiffness: 380 }}
          auto
          rotationInterval={2000}
          animatePresenceMode="wait"
          animatePresenceInitial={false}
          splitBy="characters"
        />
      </QuestContainer>

      <NavBar />

      {/*  모달: 선택한 날짜의 일기 목록 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate || "선택한 날짜"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={{ color: "#6b7280", fontWeight: "700" }}>닫기</Text>
              </Pressable>
            </View>

            {loadingDate && (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            )}

            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
              {(byDate[selectedDate] ?? []).length === 0 && !loadingDate ? (
                <Text style={{ color: "#667085", textAlign: "center", paddingVertical: 20 }}>
                  이 날짜에는 저장된 일기가 없어요.
                </Text>
              ) : (
                (byDate[selectedDate] ?? []).map((d) => (
                  <View key={d.id} style={styles.diaryItem}>
                    <Text style={styles.diaryMood}>
                      {MOOD_EMOJI[d.mood] ?? "📝"}  {d.mood.replace("_", " ")}
                    </Text>
                    <Text style={styles.diaryContent}>{d.content}</Text>
                    {d.summary? (
                        <View style={styles.summaryBox}>
                          <Text style={styles.summaryTitle}>대화 요약</Text>
                          <Text style={styles.summaryText}>{d.summary}</Text>
                        </View>
                    ):null}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    width: screenWidth, 
    padding: 20 
},
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.35)", 
    justifyContent: "flex-end" 
},
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  modalHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 8 
},
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#0f172a" 
},
  closeBtn: { 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    backgroundColor: "#f3f4f6", 
    borderRadius: 8 
},
  diaryItem: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  diaryMood: { 
    fontSize: 13, 
    color: "#334155", 
    marginBottom: 6, 
    fontWeight: "700" 
},
  diaryContent: { 
    fontSize: 15, 
    color: "#0b1220", 
    lineHeight: 21 
},
  summaryBox: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFF',
    padding: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#0b1220',
    lineHeight: 20,
  },
});
