import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo, Feather } from '@expo/vector-icons';



export default function HomeScreen() {
  
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} />
        </TouchableOpacity>
        <Text style={styles.logo}>📈 GES Stock</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out-outline" size={28} />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.userLeft}>
          <Ionicons name="person-circle-outline" size={36} />
          <Text style={styles.welcome}>Bom dia, <Text style={styles.username}>GABRIEL</Text></Text>
        </View>
        <Text style={styles.store}>Loja <Text style={styles.storeName}>LedOeste</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Grid Buttons */}
        <TouchableOpacity style={styles.box}>
          <MaterialIcons name="post-add" size={30} />
          <Text style={styles.boxText}>Cadastrar produtos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <FontAwesome5 name="search" size={24} />
          <Text style={styles.boxText}>Visualizar estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <Ionicons name="business-outline" size={30} />
          <Text style={styles.boxText}>Cadastrar Empresa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <MaterialIcons name="qr-code" size={30} />
          <Text style={styles.boxText}>Gerar QrCode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <Entypo name="flow-tree" size={30} />
          <Text style={styles.boxText}>Cadastrar categorias</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <Feather name="bar-chart-2" size={30} />
          <Text style={styles.boxText}>Exportar dados</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={26} />
          <Text>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="info-with-circle" size={26} />
          <Text>Sobre</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="menu" size={26} />
          <Text>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20,
  },
  logo: { fontSize: 20, fontWeight: 'bold' },
  userCard: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f4f3f2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  welcome: { fontSize: 16 },
  username: { fontWeight: 'bold', fontSize: 18 },
  store: { fontSize: 14, textAlign: 'right' },
  storeName: { fontWeight: 'bold' },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  box: {
    width: '40%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  boxText: { marginTop: 8, textAlign: 'center' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    backgroundColor: '#f4f3f2',
  },
});