import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NavBar(){
  const router = useRouter();
  const pathname = usePathname();

  const navIcons = [
    {
      name: '홈',
      icon: (color:string) => <Feather name="home" size={24} color={color} />,
      route: '/pages/Home'
    },
    {
      name: '일기',
      icon: (color:string) => <MaterialIcons name="chat" size={24} color={color} />,
      route: '/Diary'
    },
    {
      name: '마이',
      icon: (color:string) => <FontAwesome5 name="user-alt" size={24} color={color} />,
      route: '/pages/profile/myPage'
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {navIcons.map((item, index) => {
        const isActive = pathname === item.route;
        const color = isActive ? '#7CA6DD' : '#444';

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => handleNavigation(item.route)}
          >
            {item.icon(color)}
            <Text style={[styles.tabText, { color }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f6d9ee', // 원하는 배경색
    // borderTopLeftRadius: 25,
    // borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
