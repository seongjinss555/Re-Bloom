import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    StyleSheet
} from "react-native";
// 에러 타입 정의
interface ErrorType {
    name?: string;
    gender?: string;
    tags?: string;
    submit?: string;
}

// profileApi 임시 정의 (실제 API 경로에 맞게 수정 필요)
const profileApi = {
    checkName: async (name: string) => {
        // 실제 API 호출로 교체하세요
        const response = await fetch("http://localhost:8080/api/check-name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        const data = await response.json();
        return { data };
    }
};

export default function Register(){
    const router = useRouter();

    // 프로필 상태
    const [name, setName] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [gender, setGender] = useState("");
    const [describe, setDescribe] = useState<string>("");
    const [nameCheck, setNameCheck] = useState(false);

    // 태그 카테고리 및 태그 목록
    const [categorizedTags, setCategorizedTags] = useState<{[key: string]: string[]}>({});
    const [selectedTag, setSelectedTag] = useState("");

    // 공통 상태
    const [isloading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState<ErrorType>({});

    // 태그 상태
    const reasonTags = useMemo(() => categorizedTags.reason || [], [categorizedTags]);

    // 태그 목록 조회
    const fetchTags = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await fetch("https://rebloom-server.vercel.app/api/tags");
            const data = await response.json();
            setCategorizedTags({
                "reason": [
                    "우울증", "불안장애", "스트레스", "자존감", "사회적 불안",
                    "트라우마", "공황장애", "강박장애", "정신적 피로", "우울감"
                ],
            });
            setSelectedTag(data.reason[0]); // 기본 선택 태그 설정

        } catch (error) {
            console.error("태그를 불러오는 중 오류 발생:", error);
        }finally{
            setIsLoading(false);
        }
    }, []);

    const toggleTag = useCallback((tag: string) => {
        setTags(prevTags => {
            if (prevTags.includes(tag)) {
                return prevTags.filter(t => t !== tag);
            } else {
                return [...prevTags, tag];
            }

        });
    }, [reasonTags]);

    // 이름 중복 검사
    const checkName = async () => {
        if(!name.trim()){
            setError(prev=>({...prev, name: "이름을 입력해주세요."}));
            return;
        }

        try{
            setIsLoading(true);
            const response = await profileApi.checkName(name);
            if(response.data.exists){
                setError(prev => ({...prev, name: "이미 사용 중인 이름입니다."}));
                setNameCheck(true);
            } else {
                setError(prev => ({...prev, name: "사용 가능한 이름입니다."}));
                setNameCheck(false);
            }
        }catch(error){
            console.error("이름 중복 검사 중 오류 발생:", error);
            setError(prev => ({...prev, name: "이름 중복 검사에 실패했습니다."}));
        }
        finally{
            setIsLoading(false);
        }
    }

    const genderOptions = useMemo(()=>{
        return [
            { label: "남성", value: "남성" },
            { label: "여성", value: "여성" },
            { label: "기타", value: "기타" },];
        }, []);
    
    const handleGenderChange = (value: string) => {
        setGender(value);
        setError(prev => ({ ...prev, gender: undefined }));
    }

    const handleSubmit = async () => {
  if (!name || !gender || tags.length === 0) {
    setError({
      name: !name ? "이름을 입력하세요." : undefined,
      gender: !gender ? "성별을 선택하세요." : undefined,
      tags: tags.length === 0 ? "최소 하나의 상태를 선택해주세요." : undefined,
    });
    return;
  }

  try {
    setIsSubmitting(true);
    const payload = {
      name,
      gender,
      tags,
      describe,
    };

    const response = await fetch("https://rebloom-server.vercel.app/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/login/success"); // 성공 시 이동
    } else {
      setError(prev => ({ ...prev, submit: "회원가입에 실패했습니다." }));
    }
  } catch (err) {
    console.error("회원가입 에러:", err);
    setError(prev => ({ ...prev, submit: "서버 오류가 발생했습니다." }));
  } finally {
    setIsSubmitting(false);
  }
};

return (
     <LinearGradient
          colors={['#599fe1ff', '#FFD3F0']}
          style={styles.container}
        >



        </LinearGradient>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // 추가 스타일 정의
})
