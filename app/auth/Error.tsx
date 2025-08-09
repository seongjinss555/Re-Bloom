import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AuthError(){
    const router = useRouter();
    const { error } = useLocalSearchParams<{error: string}>();

    const handleGoBack = () => {
        router.replace('/');
    };

    return(
        <View style={styles.container}>
            <Text style={styles.errorText}>인증 오류: {error}</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.button}>
                <Text style={styles.buttonText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles= StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', 
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#599fe1ff',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});