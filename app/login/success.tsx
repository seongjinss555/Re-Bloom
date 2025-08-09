import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect } from "react";

export default function LoginSuccessScreen() {
    const router = useRouter();
    const { token, mode } = useLocalSearchParams();

    useEffect(() =>{
        if(typeof token === 'string'){
            SecureStore.setItemAsync('accessToken', token).then(()=>{
                if(mode === 'signup'){
                    router.replace('/auth/Register');
                }else{
                    router.replace('/'); // 로그인 성공 후 홈으로 이동
                }
            });
        }
    }, [token, mode]);
    return null;
}