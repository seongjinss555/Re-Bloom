import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABBAR_BASE_HEIGHT = 56; 

export default function NavBar(){
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); 

  const navIcons = [
    { name: '홈',  icon: (color:string) => <Feather name="home" size={24} color={color} />, route: '/pages/Home' },
    { name: '일기', icon: (color:string) => <MaterialIcons name="chat" size={24} color={color} />, route: '/pages/diary/Diary' },
    { name: '마이', icon: (color:string) => <FontAwesome5 name="user-alt" size={24} color={color} />, route: '/pages/profile/myPage' },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const barHeight = TABBAR_BASE_HEIGHT + insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: 0,
          height: barHeight,
          paddingBottom: insets.bottom,
        }
      ]}
    >
      {navIcons.map((item, index) => {
        const isActive = pathname === item.route;
        const color = isActive ? '#7CA6DD' : '#444';

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.8}
          >
            {item.icon(color)}
            <Text style={[styles.tabText, { color }]}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f6d9ee',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
