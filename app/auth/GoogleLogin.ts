import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

//구글 인증 url
const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/autohorize/google';

export async function googleLogin(): Promise<{
    token: string;
    refreshToken: string | undefined;
    user: any;
}>{
    console.log("googleLogin called");

    if(Platform.OS === 'web'){
        return webGoogleLogin();
    } else{
        return nativeGoogleLogin();
    }
}

function webGoogleLogin(): Promise<{
    token: string;
    refreshToken: string | undefined;
    user: any;
}>{
    return new Promise((resolve, reject)=>{
        try{
            console.log("Web Google Login initiated");

            //먼저 이미 url에 토큰 정보가 있는지 확인
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get('accessToken');
            const refreshToken = urlParams.get('refreshToken');
            const userId = urlParams.get('userId');

            //이미 토큰 정보가 url에 있다면 처리
            if(accessToken && userId){
                console.log("url에서 구글 로그인 정보 찾음",{
                    accessToken,
                    refreshToken,
                    userId,
                });

                //url에서 파라미터 제거
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);

                //로그인 성공 반환
                resolve({
                    token: accessToken,
                    refreshToken: refreshToken || undefined, // null일 경우 undefined로 처리
                    user: {
                        id: parseInt(userId),
                    }
                });

                return;
            }

            // 토큰 정보가 없다면 로그인 페이지로 리다이렉트
            const callbackUrl = `${window.location.origin}/auth/socialCallback`;

            // 리다이렉트 url 구성
            const redirectUrl = `${GOOGLE_AUTH_URL}?web=true`;
            // 현재 창에서 직접 리다이렉트
            window.location.href = redirectUrl;
        }catch(error){
            console.error("webGoogleLogin 오류:", error);
            reject(error);
        }
    });
}

// 네이티브 환경에서 구글 로그인 처리
function nativeGoogleLogin(): Promise<{
    token: string;
    refreshToken: string | undefined;
    user: any;
}>{
    return new Promise((resolve, reject)=>{
        // url 이벤트 핸들러
        const handleUrl = async ({url}: {url: string})=>{
            console.log("URL 이벤트 수신 : ", url);

            if(url&&(url.includes("auth-callback"))){
                try{
                    // 브라우저 세션 닫기 시도
                    try {
                        await WebBrowser.dismissAuthSession();
                    }catch(e){
                        console.warn("브라우저 세션 닫기 오류", e);
                    }

                    //url 파라미터 추출
                    const urlObj = new URL(url);
                    const accessToken = urlObj.searchParams.get("accessToken");
                    const refreshToken = urlObj.searchParams.get("refreshToken");
                    const userId = urlObj.searchParams.get("userId");

                    if(!accessToken || !userId){
                        throw new Error("로그인 정보가 부족합니다.");
                    }

                    // 로그인 데이터 반환
                    resolve({
                        token: accessToken,
                        refreshToken: refreshToken || undefined, // null일 경우 undefined로 처리
                        user:{
                            id: parseInt(userId),
                        },
                    });
                }catch(error){
                    console.error("로그인 처리 중 오류 발생:", error);
                    reject(error);
                }finally{
                    subscription.remove(); // url 리스너 제거
                }
            }
        };
            // url 리스너 등록
            const subscription = Linking.addEventListener('url', handleUrl);

            // native 리다이렉트 url
            const redirectUrl = "rebloom://auth-callback";
            console.log("네이티브 구글 로그인 시작", redirectUrl);

            // 인증 세션 열기
            WebBrowser.openAuthSessionAsync(GOOGLE_AUTH_URL, redirectUrl)
            .then((result)=>{
                console.log("WebBrowser.openAuthSessionAsync 결과:", result);
                // dismiss를 제외한 모든 결과는 실패로 간주
                if(result.type !== 'success' && result.type !== 'dismiss'){
                    subscription.remove(); // url 리스너 제거
                    reject(new Error("구글 로그인 인증 실패"));
                }
            })
            .catch((error)=>{
                console.error("WebBrowser.openAuthSessionAsync 오류:", error);
                subscription.remove(); // url 리스너 제거
                reject(error);
            });
    });
}

// 로그인 콜백 상태 확인 함수
export function handleGoogleLoginCallback(): {
    token: string | null;
    refreshToken: string | null;
    user : any | null;
} | null{
    if(Platform.OS === 'web')
        return null; // 웹에서는 별도의 콜백 처리가 필요 없음

    // url 파라미터에서 토큰 정보 추출
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');

    if(accessToken && userId){
        console.log("구글 로그인 정보 확인");

        // url에서 파라미터 제거
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // 로그인 성공 정보 반환
        return{
            token: accessToken,
            refreshToken: refreshToken || null,
            user:{
                id: parseInt(userId),
            },
        };
    }

    return null; // 로그인 정보가 없으면 null 반환
}

// 라우팅을 위한 기본 내보내기 컴포넌트
export default function GoogleLoginComponent(){
    // 이 컴포넌트는 실제로 렌더링되지 않지만, 라우팅을 위해 필요
    return null;
}