import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !((globalThis as any).nativeFabricUIManager)
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'How do I book a property?',
    answer: 'To book a property, simply browse our listings, select the property you like, choose your dates, and click the "Book Now" button. Follow the payment instructions to complete your reservation.',
  },
  {
    id: '2',
    category: 'General',
    question: 'Is it free to use this app?',
    answer: 'Yes, downloading and browsing the app is completely free. You only pay when you make a booking or list a property (if applicable fees apply).',
  },
  {
    id: '3',
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards (Visa, MasterCard), bank transfers, and popular e-wallets. All transactions are secured.',
  },
  {
    id: '4',
    category: 'Payments',
    question: 'Can I get a refund?',
    answer: 'Refund policies vary by property owner. Please check the specific cancellation policy listed on the property detail page before booking.',
  },
  {
    id: '5',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to the login screen and tap "Forgot Password". Enter your email address, and we will send you instructions to reset your password.',
  },
  {
    id: '6',
    category: 'Account',
    question: 'Can I change my profile picture?',
    answer: 'Yes, go to Profile > Edit Profile to update your personal information and profile picture.',
  },
];

const FaqProfScreen: React.FC = () => {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Frequently Asked Questions
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find answers to common questions about using our service.
        </Text>
      </View>

      <View style={styles.content}>
        {faqs.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.9}
            >
              <View style={styles.questionRow}>
                <View style={styles.iconContainer}>
                  <Icon
                    name="help-circle-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.questionText, { color: colors.text }]}>
                  {item.question}
                </Text>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={[styles.answerText, { color: colors.textSecondary }]}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Still have questions?
        </Text>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    padding: 16,
  },
  faqItem: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    paddingLeft: 52, // Align with text start
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    marginBottom: 16,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaqProfScreen;
