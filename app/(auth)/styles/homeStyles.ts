// app/(auth)/styles/homeStyles.ts

import { StyleSheet } from 'react-native';
import { Theme } from '../../../utils/styles/theme';

const homeStyles = (theme: Theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginHorizontal: 20, <--- REMOVER ESTA LINHA!
    paddingHorizontal: 20, // <--- AJUSTAR ESTE PADDING para o valor desejado (ex: 20)
    backgroundColor: theme.cardBackground,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  userCard: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: theme.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  welcome: {
    fontSize: 16,
    color: theme.text,
  },
  username: {
    fontWeight: 'bold', fontSize: 18,
    color: theme.text,
  },
  store: {
    fontSize: 14, textAlign: 'right',
    color: theme.text,
  },
  storeName: {
    fontWeight: 'bold',
    color: theme.text,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 10,
    flexGrow: 1,
  },
  box: {
    width: '40%',
    padding: 15,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  boxVizu: {
    width: '80%',
    padding: 15,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  boxText: {
    marginTop: 8, textAlign: 'center',
    color: theme.text,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    backgroundColor: theme.cardBackground,
    borderTopColor: theme.cardBorder,
  },
});

export default homeStyles;