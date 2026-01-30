const API_BASE_URL = 'https://offseason.onrender.com';

interface ChatResponse {
  response: string;
}

interface ChatApiError {
  error: string;
}

export const chatService = {
  sendMessage: async (
    userId: string,
    message: string
  ): Promise<{ success: boolean; response?: string; error?: string }> => {
    try {
      console.log('chatService - Sending message for user:', userId);

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ChatApiError;
        console.log('chatService - Error sending message:', errorData.error);
        return { success: false, error: errorData.error };
      }

      const chatData = data as ChatResponse;
      console.log('chatService - Message sent successfully');
      return { success: true, response: chatData.response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('chatService - Exception sending message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};
