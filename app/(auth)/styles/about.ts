import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 5,
  },
  spacer: {
    width: 28,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  logo: {
    width: 120, 
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  bulletList: {
    marginTop: 5,
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  }
});