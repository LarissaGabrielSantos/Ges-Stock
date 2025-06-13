import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {Link} from 'expo-router';
import { styles } from '../(auth)/styles/welcome';

import * as Animatable from 'react-native-animatable'

export default function welcome(){
    return(
        <View style={styles.container}>
            <View style={styles.containerLogo}>
                <Animatable.Image
                    animation="flipInY"
                    source={require('../../assets/logo.png')}
                    style={{width : '100%'}}
                    resizeMode="contain"
                />
            </View>

            <Animatable.View delay={600} animation="fadeInUp" style={styles.containerForm}>
                <Text style={styles.title}>Organize seu estoque, simplifique sua vida, use GES Stock!</Text>
                <Text style={styles.text}>Gerencie seu estoque de forma simples e eficiente. Adicione, monitore e controle seus produtos!</Text>
            <Link href={"/(public)/login"} asChild style={{
                position:'absolute',
                backgroundColor:'#38a69d',
                borderRadius:50,
                paddingVertical:8,
                width:'60%',
                alignSelf:'center',
                bottom:'15%',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Acessar</Text>
                </TouchableOpacity>
            </Link>
            </Animatable.View>
        </View>
    );
}

