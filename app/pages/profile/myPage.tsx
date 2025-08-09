import NavBar from '@/layout/NavBar';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyPage() {
    const [userData, setUserData] = useState({
        name: '안성진',
        profileImg: require('../../../assets/images/profile.png'),
    });

    const handleLogout = () => {
        // 로그아웃 로직 구현
        console.log("로그아웃 버튼 클릭");
    }

    const handleEditProfile = () => {
        // 프로필 수정 로직 구현
        console.log("프로필 수정 버튼 클릭");
    }

    const handleDeleteAccount = () =>{
        // 계정 삭제 로직 구현
        console.log("계정 삭제 버튼 클릭");
    }
    
    useEffect(() => {
        // 사용자 데이터 불러오기 로직 (예: API 호출)
        // setUserData({ name: '새로운 이름', profileImg: require('새로운 이미지 경로') });
    }, []);

    return (
        <View style={styles.container}>
            {/* 프로필 영역*/}
            <View style={styles.profileSection}>
                <Image source={userData.profileImg} style={styles.profileImage}/>
                <Text style={styles.name}>{userData.name}</Text>
                 <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.Text}>로그아웃</Text>
                </TouchableOpacity>
            </View>

            {/* 버튼 영역 */}
            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
                    <Text style={styles.Text}>프로필 수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
                    <Text style={styles.Text}>계정 탈퇴</Text>
                </TouchableOpacity>
            </View>
            <NavBar/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ' #f0f0f0',
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 90,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    buttonSection: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#599fe1ff',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
    },
    Text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    
}); 
