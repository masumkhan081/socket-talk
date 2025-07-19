import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiHandler } from '../../services/api';
import API_ENDPOINTS from '../../services/endpoints';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
  avatar?: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandler.get<{ conversations: Conversation[] }>(
        API_ENDPOINTS.CHAT.CONVERSATIONS
      );
      return response.conversations;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await apiHandler.get<{ messages: Message[] }>(
        API_ENDPOINTS.CHAT.MESSAGES(conversationId)
      );
      return { conversationId, messages: response.messages };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.loading = false;
      state.conversations = action.payload;
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentConversation, addMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
