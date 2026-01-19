import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

const chatSendIcon = require('../../assets/chat/chat-send.png');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "I'm here whenever you want to chat about your training!",
    isUser: false,
  },
];

export const AiChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsAiTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setTimeout(() => {
      setIsAiTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'll help you adjust your training plan. Let me update your schedule to focus on weightlifting and running sessions.",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.text}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.aiMessageContainer}>
        <View style={styles.aiBubble}>
          <Text style={styles.aiText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isAiTyping) return null;
    return (
      <View style={styles.aiMessageContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={[styles.dismissArea, { paddingTop: insets.top + 60 }]}
        activeOpacity={1}
        onPress={handleClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.chatContainer, { marginBottom: insets.bottom + 94 }]}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderTypingIndicator}
          />
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type here..."
                placeholderTextColor={colors.offWhite}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Image
                  source={chatSendIcon}
                  style={styles.sendIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dismissArea: {
    flex: 1,
  },
  keyboardAvoid: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
  },
  chatContainer: {
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    maxHeight: 330,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 15,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiBubble: {
    backgroundColor: colors.beige,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 14,
    maxWidth: '85%',
  },
  aiText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.darkBrown,
    lineHeight: 20,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.darkBrown,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    padding: 14,
    maxWidth: '85%',
  },
  userText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
  },
  typingBubble: {
    backgroundColor: colors.beige,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.darkBrown,
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkBrown,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.darkBrown,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 15,
    color: colors.offWhite,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendIcon: {
    width: 19,
    height: 19,
  },
});
