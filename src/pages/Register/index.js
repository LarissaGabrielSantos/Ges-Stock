import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import * as Animatable from 'react-native-animatable'

export default function Register(){
    const navigation = useNavigation();
    return(
        
        <View style={styles.container}>
            <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
                <Text style={styles.message}>Cadastre-se!</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>

                <Text style={styles.title}>Nome</Text>
                <TextInput
                    placeholder="Informe seu nome:"
                    style={styles.input}
                />

                <Text style={styles.title}>Nome da empresa</Text>
                <TextInput
                    placeholder="Informe o nome da empresa:"
                    style={styles.input}
                />

                <Text style={styles.title}>Email</Text>
                <TextInput
                    placeholder="Informe seu email:"
                    style={styles.input}
                />

                <Text style={styles.title}>Senha</Text>
                <TextInput
                    placeholder="Informe sua senha:"
                    style={styles.input}
                />

                <Text style={styles.title}>Confirme sua senha</Text>
                <TextInput
                    placeholder="Informe sua senha novamente:"
                    style={styles.input}
                />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonRegister}onPress={()=> navigation.navigate('Login')}>
                    <Text style={styles.registerText}>Já possui conta? Faça Login!</Text>
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
        flex:1,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingStart:'5%',
        paddingEnd:'5%'
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
    }
})