import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: '#38a69d',
  },
  container: {
    flex: 1,
  },
  containerHeader: {
    marginBottom: '8%',
    paddingStart: '5%',
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  containerForm: {
    backgroundColor: '#FFF',
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: '5%',
    paddingEnd: '5%'
  },
  title: {
    fontSize: 20,
    marginTop: 28,
  },
  input: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonForget: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#38a69d',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 10, 
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonRegister: {
    marginTop: 14,
    alignSelf: 'center'
  },
  registerText: {
    color: '#a1a1a1'
  }
});