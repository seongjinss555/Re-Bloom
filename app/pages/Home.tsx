import Header from "@/layout/Header";
import NavBar from "@/layout/NavBar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Calendar } from 'react-native-calendars';

const {width : screenWidth} = Dimensions.get('window');

export default function HomeScreen(){
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const router = useRouter();
    const [selectedDate, setSeletedDate] = useState('');


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
    <TouchableOpacity onPress={goQuest} style={styles.QuestContainer}>
    <LinearGradient
        colors={['#5EC6F5', '#007AFF']}
        style={styles.QuestContainer}
    >
        <Image
            source={require('../../assets/images/crown.png')}
            style={{width: 50, height: 50, marginBottom: 10}}
        />
        <Text
            style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 10,
            }}
        >오늘의 퀘스트를 확인해보세요!</Text>
    </LinearGradient>
    </TouchableOpacity>
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

    QuestContainer:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth - 80,
        height: 115,
        padding: 20,
        borderRadius: 20,
        position: 'absolute',
        bottom: 100,
    }
});