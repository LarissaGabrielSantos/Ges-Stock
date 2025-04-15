import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import * as Animatable from 'react-native-animatable'

export default function Register(){
    const navigation = useNavigation();
    return(
        
        <View style={styles.container}>
            <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
                <Text style={styles.message}>Reset de senha</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>

                <Text style={styles.title}Nome></Text>
                <TextInput
                    placeholder="Digite seu email cadastrado para receber o código:"
                    style={styles.input}
                />


                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>


            </Animatable.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#38a69d',
    },
    containerHeader:{
        marginTop:'14',
        marginBottom:'8%',
        paddingStart:'5%', 
    },
    message:{
        fontSize:28,
        fontWeight:'bold',
        color: '#FFF',
    },
    containerForm:{
        backgroundColor:'#FFF',
        flex:0.3,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingStart:'5%',
        paddingEnd:'5%',
        justifyContent:'center',
        alignItems:'center',
    },
    title:{
        fontSize:20,
        marginTop:28,
    },
    input:{
        borderBottomWidth:1,
        height:40,
        marginBottom:12,
        fontSize:16,
    },
    buttonForget:{
        fontWeight:'bold',
        justifyContent:'center',
        alignItems:'center'
    },
    button:{
        backgroundColor:'#38a69d',
        width:'100%',
        borderRadius:15,
        paddingVertical:2,
        marginTop:14,
        justifyContent:'center',
        alignItems:'center'
    },
    buttonText:{
        color:'#FFF',
        fontSize:18,
        fontWeight:'bold'
    },
    buttonRegister:{
        marginTop:14,
        alignSelf:'center'
    },
    registerText:{
        color:'a1a1a1'
    },

})