import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  
  // Animation values
  const fadeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Stagger animation for images
    const imageAnimations = fadeAnims.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      ...imageAnimations,
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonSlideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      
      {/* Property Images Grid */}
      <View style={styles.imageGrid}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Animated.View style={[styles.imageContainer, styles.largeImage, { opacity: fadeAnims[0], backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
          <View style={styles.column}>
            <Animated.View style={[styles.imageContainer, styles.mediumImage, { opacity: fadeAnims[1] }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' }}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View style={[styles.imageContainer, styles.mediumImage, { opacity: fadeAnims[2] }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400' }}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <Animated.View style={[styles.imageContainer, styles.smallImage1, { opacity: fadeAnims[3] }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
          <Animated.View style={[styles.imageContainer, styles.mediumImage, { opacity: fadeAnims[4] }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <Animated.View style={[styles.imageContainer, styles.smallImage, { opacity: fadeAnims[5] }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
          <Animated.View style={[styles.imageContainer, styles.smallImage, { opacity: fadeAnims[5] }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
          <Animated.View style={[styles.imageContainer, styles.smallImage, { opacity: fadeAnims[5] }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </View>

      {/* Content Section */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: contentFadeAnim,
          }
        ]}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Ready to start a new chapter?</Text>
        <Text style={[styles.subheading, { color: colors.text }]}>RentVerse is here to guide you home</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY: buttonSlideAnim }],
            opacity: contentFadeAnim,
          }
        ]}
      >
        <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.signupButton, { borderColor: colors.border }]} onPress={handleSignup}>
          <Text style={[styles.signupButtonText, { color: colors.text }]}>Sign up</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageGrid: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  largeImage: {
    width: (width - 44) * 0.4,
    height: 200,
  },
  mediumImage: {
    flex: 1,
    height: 94,
  },
  smallImage: {
    flex: 1,
    height: 120,
  },
  smallImage1: {
    flex: 2,
    height: 94,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 20,
  },
  heading: {
    fontSize: 23,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  loginButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0F6980',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
