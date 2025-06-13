import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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