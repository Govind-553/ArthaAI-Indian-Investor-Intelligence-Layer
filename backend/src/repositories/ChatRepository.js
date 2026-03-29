export class ChatRepository {
  async createConversationRecord(payload) {
    return {
      id: `chat-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }
}
