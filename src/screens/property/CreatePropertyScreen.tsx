import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import CreatePropertyForm from '../../components/CreatePropertyForm';

type CreatePropertyScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'CreateProperty'
>;

interface Props {
  navigation: CreatePropertyScreenNavigationProp;
}

const CreatePropertyScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CreatePropertyForm
            onBack={() => navigation.goBack()}
            onSuccess={() => navigation.goBack()}
            showHeader={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default CreatePropertyScreen;
