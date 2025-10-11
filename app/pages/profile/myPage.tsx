import NavBar from '@/layout/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyPage() {
  const [userData] = useState({
    name: '안성진',
    profileImg: require('../../../assets/images/profile.png'),
  });

  const handleLogout = () => console.log('로그아웃 버튼 클릭');
  const handleEditProfile = () => console.log('프로필 수정 버튼 클릭');
  const handleDeleteAccount = () => console.log('계정 삭제 버튼 클릭');

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Image source={userData.profileImg} style={styles.profileImage} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>마이페이지</Text>
            <Text style={styles.name}>{userData.name}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogout}>
            <LinearGradient
              colors={['#74B6F2', '#2F80ED']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.smallGradBtn}
            >
              <Text style={styles.smallGradText}>로그아웃</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* 액션 버튼들 */}
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.9} style={styles.actionBtn} onPress={handleEditProfile}>
            <Text style={styles.actionText}>프로필 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={[styles.actionBtn, styles.dangerBtn]} onPress={handleDeleteAccount}>
            <Text style={[styles.actionText, styles.dangerText]}>계정 탈퇴</Text>
          </TouchableOpacity>
        </View>
      </View>
      <NavBar />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#2A2E39',
  sub: '#6B7280',
  primary: '#2F80ED',
  primarySoft: '#E6F0FF',
  border: '#E5E7EB',
  dangerBg: '#FFF1F2',
  danger: '#E11D48',
};

const RADIUS = 16;
const GAP = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  card: {
    backgroundColor: COLORS.card,

    borderRadius: RADIUS,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 20,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },

  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 999,
    padding: 3,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 999,
  },

  greeting: {
    color: COLORS.sub,
    fontSize: 13,
    marginBottom: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },

  smallGradBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  smallGradText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
    opacity: 0.8,
  },

  actions: {
    gap: 12,
  },

  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  dangerBtn: {
    backgroundColor: COLORS.dangerBg,
    borderColor: 'transparent',
  },
  dangerText: {
    color: COLORS.danger,
  },
});
