import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import * as Animatable from 'react-native-animatable'

export default function Register(){
    const navigation = useNavigation();
    return(
        
        <View style={styles.container}>
            <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
                <Text style={styles.message}>Alterar Senha</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <Text style={styles.ForgotText}>Esqueceu sua senha? </Text>
                <Text style={styles.text}>não se preocupe, enviaremos ao seu Email</Text> 
                <Text style={styles.text}>um codigo para checar sua autenticidade.</Text>

                <Text style={styles.title}Nome>Email da conta:</Text>
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
        flex:0.5,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomLeftRadius:25,
        borderBottomRightRadius:25,
        paddingStart:'5%',
        paddingEnd:'5%',
        justifyContent:'center',    
    },

    ForgotText:{
        color:'#38a69d',
        fontSize:22,
        fontWeight:'bold',
        marginBottom:10,
    },

    text:{
        fontSize:16,
        
    },
    title:{
        fontSize:18,
        marginTop:52,
        marginBottom:10,
        textAlign:'left',
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