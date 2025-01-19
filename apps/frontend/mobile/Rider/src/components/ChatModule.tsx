import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {images} from '../assets/images/images';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'receiver';
  time: string;
  senderImage?: string;
}

interface ChatModuleProps {
  messages: Message[];
  onSend: (message: string) => void;
  headerTitle: string;
  onReport?: () => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({
  messages,
  onSend,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const renderMessageBubble = ({item}: {item: Message}) => {
    const isUser = item.sender === 'user';
    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.receiverMessage,
          ]}>
          {!isUser && item.senderImage && (
            <Image
              source={{uri: item.senderImage}}
              style={styles.senderImage}
            />
          )}
          <View
            style={[styles.textContainer, isUser && styles.userTextContainer]}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.receiverText,
              ]}>
              {item.text}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.timeText,
            isUser ? styles.userTimeText : styles.receiverTimeText,
          ]}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessageBubble}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted
      />

      {/* Input Field */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Enter message..."
            placeholderTextColor={colors.text.primaryGrey}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Image source={images.sendIcon} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  messageWrapper: {
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '70%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
  },
  senderImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  userTextContainer: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  messageText: {
    fontSize: typography.fontSize.medium,
  },
  userText: {
    color: colors.white,
  },
  receiverText: {
    color: colors.text.primary,
  },
  timeText: {
    fontSize: typography.fontSize.small,
    color: colors.text.primaryGrey,
    marginTop: 5,
  },
  userTimeText: {
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  receiverTimeText: {
    alignSelf: 'flex-start',
    marginLeft: 45, // Account for the sender image width
  },
  messageList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.white,
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.lightButtonBackground,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: colors.purple,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
});

export default ChatModule;
