import Header from "@/layout/Header";
import NavBar from "@/layout/NavBar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuestContainer from "../../constants/QuestContainer";
import RotatingText from "../../constants/RotatingText";
const {width : screenWidth} = Dimensions.get('window');

export default function HomeScreen(){
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const router = useRouter();
    const [selectedDate, setSeletedDate] = useState('');
    const insets = useSafeAreaInsets();

    const goQuest = () => {
        router.push('/pages/quest/Quest')
    }

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim,{
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim,{
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    },[]);

    useEffect(() => {
        Animated.timing(fadeAnim,{
            toValue: 1,
            duration: 1000,
            delay: 1200,
            useNativeDriver: true,
        }).start();
    }, []);


    return (
    <LinearGradient
        colors={['#599fe1ff', '#FFD3F0']}
        style={styles.container}
    >
    <Header />
    <Calendar
        style={{flex: 1, width: screenWidth - 80, marginBottom: 210, borderRadius: 5}}
        onDayPress={(day) => {
            setSeletedDate(day.dateString);
            console.log('Selected day', day);
        }
        }
        markedDates={{
            [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: '#599fe1ff',
            },
        }}
        theme={{
            selectedDayBackgroundColor: '#599fe1ff',
            todayTextColor: '#ea1717ff',   
            arrowColor: '#599fe1ff',
            monthTextColor: '#599fe1ff',
            textDayFontFamily: 'Roboto',
            textMonthFontFamily: 'Roboto',
            textDayHeaderFontFamily: 'Roboto',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 16,
            textSectionTitleColor: '#599fe1ff',
            textDisabledColor: '#d9e1e8',
            dotColor: '#599fe1ff',
            selectedDotColor: '#ffffff',
        }}     
    />
    <QuestContainer
        onPress={goQuest}
        style={{
            width: screenWidth - 80,
            height: 140,
            borderRadius: 20,
            position: 'absolute',
            bottom: 100,
    }}
    >
    <RotatingText
        texts={['오늘은', '산책하기!', '오늘은', '운동하기!', '오늘은', '명상하기!', '오늘은', '일기쓰기!']}
        mainClassName="px-3 py-1 rounded-lg bg-transparent"     
        splitLevelClassName="overflow-hidden pb-1 rt-word"     
        elementLevelClassName="rt-element"                
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-120%', opacity: 0 }}
        staggerFrom="last"
        staggerDuration={0.03}
        transition={{ type: 'spring', damping: 26, stiffness: 380 }}
        auto
        rotationInterval={2000}
        animatePresenceMode="wait"          
        animatePresenceInitial={false}     
        splitBy="characters"                
    />
   </QuestContainer>
    <NavBar />
    </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
        padding: 20,
    },
});