import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header(){
    const router = useRouter();

    const GoHome = () => {
        router.push('/pages/Home');
    }

    return (
        <View style={styles.HeaderContainer}>
            <TouchableOpacity onPress={GoHome}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={{width: 40, height: 40}}
                />
            </TouchableOpacity>
            <Text style={{fontSize: 10, marginRight: 20, color: 'white'}}>Re:Bloom</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    HeaderContainer:{
        flexDirection: 'column',
        top: 50,
        left: 30,
        position: 'absolute',
    }


})