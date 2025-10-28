import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../config/api';

type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type ProfileResponse = {
    concerns: string[];
    other?: string;
    gender?: Gender | null;
};

const BG = '#F9FAFF';

const CONCERN_TAGS = [
    '우울감',
    '무기력함',
    '불안감',
    '대인 관계',
    '스트레스',
    '집중력 부족',
    '사회적 고립감',
    '의욕 저하',
];

export default function EditProfile(){
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [concerns, setConcerns] = useState<string[]>([]);
    const [other, setOther] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);

    /// 초기값 저장
    const [initialData, setInitialData] = useState<ProfileResponse | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean>(false);

    const changed = useMemo(() =>{
        const baseData: ProfileResponse = initialData ?? {concerns:[], other:'', gender: null};
        const first = new Set(baseData.concerns || []);
        const second = new Set(concerns);

        const concernsChanged = first.size !== second.size || [...first].some((item) => !second.has(item));
        const otherChanged = (baseData.other ?? '') !== other;
        const genderChanged = (baseData.gender ?? null) !== gender;
        return concernsChanged || otherChanged || genderChanged;
    }, [initialData, concerns, other, gender]);

    const normallizeGender = (g:any):Gender | null => {
        if(!g) return null;
        const u = String(g).toUpperCase();
        if(u === 'MALE' || u === 'FEMALE' || u === 'OTHER') return u as Gender;
        return null;
    };
    
    // 프로필 정보 불러오기
    useEffect(() => {
        (async () => {
            try{
                const {data} = await api.get<ProfileResponse>('/api/profile/me');
                const g = normallizeGender(data?.gender);
                setConcerns(data?.concerns ?? []);
                setOther(data?.other ?? '');
                setGender(g);
                setInitialData({
                    concerns: data?.concerns ?? [],
                    other: data?.other?? '',
                    gender: g,
                });
                setHasProfile(true); // 이미 프로필 작성함
            }catch(e: any){
                console.log(['프로필 정보 불러오기 실패', e?.response?.data ?? e?.message]);
                setConcerns([]);
                setOther('');
                setGender(null);
                setInitialData(null);
                setHasProfile(false);
            }finally{
                setLoading(false);
            }
        })();
    },[]);

    // 목적 토글
    const toggle = (label: string) => {
        setConcerns((prev) => 
            prev.includes(label)? prev.filter((item)=> item !== label): [...prev, label]);
    };

    // 저장 처리
    const onSave = async(): Promise<boolean> => {
        console.log('[onSave] enter', {saving, changed});
        if(saving || !changed) return false;
        setSaving(true);

        const body = {concerns, other: other.trim(), gender};

        try{
          await api.put('/api/profile',body);
          setInitialData(body);
          setHasProfile(true);
          return true;
        }catch(e:any){
            console.log('프로필 저장 실패', e?.response?.data ?? e?.message);
            Alert.alert('프로필 저장에 실패했어요. 다시 시도해주세요.');
            return false;
        }finally{
            setSaving(false);
        }
    };

    const goBack = () => {
        if(!changed){
            router.push('/pages/profile/myPage'); 
            return;
        }

        Alert.alert(
            '변경 사항이 있어요',
            '내용이 저장하지 않고 나가시겠어요?\n변경 사항은 저장되지 않습니다.',
            [
                { text: '취소', style: 'cancel'},
                {
                    text: '저장 후 나가기',
                    onPress: async() => {
                        const ok = await onSave();
                        if(ok) router.push('/pages/profile/myPage');
                    },
                },
                {
                    text: '저장 안 함',
                    style: 'destructive',
                    onPress: () => router.push('/pages/profile/myPage'),
                },
            ]
        );
    };
    
    return(
        <KeyboardAvoidingView
            style={[styles.screen, { paddingTop: insets.top}]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header,{zIndex:2}]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={goBack} style={styles.backBtn}>
                        <Text style={styles.backIcon}>⬅</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>프로필 수정</Text>
                    <View style={{width: 32}}/>
                </View>
                <Text style={styles.headerSub}>나를 더 잘 이해할 수 있도록 간단히 알려주세요</Text>
            </View>

            {loading ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator />
                </View>
                ) : (
                <>
                {/* 콘텐츠 */}
                <ScrollView
                  contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                  keyboardShouldPersistTaps="handled"
                  style={{ backgroundColor: BG }}
                >

                {/* 카드: 상태(칩) */}
                <View style={styles.card}>
                <Text style={styles.cardTitle}>
                나의 상태
                <Text style={styles.cardHint}> (가장 공감되는 키워드를 골라주세요. 복수 선택 가능)</Text>
                </Text>

                <View style={styles.chipWrap}>
                  {CONCERN_TAGS.map((label) => {
                    const selected = concerns.includes(label);
                    return (
                      <Pressable
                        key={label}
                        onPress={() => toggle(label)}
                        style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
                    </View>
                </View>

                {/* 카드: 기타 메모 */}
                <View style={styles.card}>
                 <Text style={styles.cardTitle}>기타</Text>
                 <View style={styles.textArea}>
                    <TextInput
                      style={styles.textAreaInput}
                      placeholder="다른 이유가 있다면 자유롭게 적어주세요!"
                      placeholderTextColor="#9AA3AF"
                      value={other}
                      onChangeText={setOther}
                      multiline
                      textAlignVertical="top"
                    />
                 </View>
                </View>

               {/* 카드: 성별(세그먼트) */}
                <View style={styles.card}>
                <Text style={styles.cardTitle}>성별</Text>
                <View style={styles.segment}>
                    {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => {
                  const selected = gender === g;
                  const label = g === 'MALE' ? '남성' : g === 'FEMALE' ? '여성' : '기타/밝히지 않음';
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.segItem, selected && styles.segItemSelected]}
                    >
                      <Text style={[styles.segText, selected && styles.segTextSelected]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                 })}
                </View>
                </View>
                </ScrollView>

                {/* 하단 저장 바 */}
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Pressable
                 onPress={async () =>{
                    const ok = await onSave();
                    console.log('result : ',ok);
                    if(ok){
                        Alert.alert('정보가 정상적으로 수정되었습니다');
                        router.replace('/pages/profile/myPage');
                    }
                 }}
                 disabled={!changed || saving}
                 style={[styles.saveBtn, (!changed || saving) && styles.saveBtnDisabled]}
                >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>정보 수정하기</Text>
                )}
                </Pressable>
                </View>
            </>)}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7FB' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EAECEF',
    borderBottomWidth: 1,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  backIcon: { color: '#111827', fontSize: 18, fontWeight: '800' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSub: {
    color: '#667085',
    marginTop: 2,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  // 로딩 영역
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // 카드
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 14,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  cardHint: { fontSize: 12, color: '#667085', fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#6E59FF',
    borderWidth: 0,
    shadowColor: '#6E59FF',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipText: { color: '#334155', fontWeight: '700' },
  chipTextSelected: { color: '#FFFFFF' },
  textArea: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FAFBFF',
    padding: 12,
  },
  textAreaInput: {
    minHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    color: '#0B1220',
  },
  // 세그먼트
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  segItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segItemSelected: {
    backgroundColor: '#6E59FF',
    shadowColor: '#6E59FF',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  segText: { color: '#344054', fontWeight: '700' },
  segTextSelected: { color: '#FFFFFF' },

  // 하단 고정 바
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderColor: '#EAECF0',
  },
  // 저장 버튼
  saveBtn: {
    backgroundColor: '#6E59FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6E59FF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  saveBtnDisabled: { backgroundColor: '#C7D2FE' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});