import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {Link} from 'expo-router';

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

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: '#38a69d'
    },
    containerLogo:{
        flex:0.5,
        backgroundColor: '#38a69d',
        justifyContent: 'center',
    },
    containerForm:{
        flex:0.5,
        backgroundColor: '#FFF',
        borderTopLeftRadius:25,
        borderTopRightRadius:25,
        paddingStart: '5%',
        paddingEnd: '5%'
    },
    title:{
        fontSize:22,
        fontWeight:'bold',
        marginTop:28,
        marginBottom:12,
    },
    button:{
        position:'absolute',
        backgroundColor:'#38a69d',
        borderRadius:50,
        paddingVertical:8,
        width:'60%',
        alignSelf:'center',
        bottom:'15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText:{
        textAlign:'center',
        fontSize:18,
        color:'#FFF',
        fontWeight:'bold'
    },
    text:{
        fontSize:15,
        fontWeight:'semibold'
    },
})