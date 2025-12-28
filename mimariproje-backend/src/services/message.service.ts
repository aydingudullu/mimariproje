import { prisma } from '../lib/prisma';

interface ConversationWithDetails {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: Date;
  last_message_at: Date | null;
  otherUser: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
    user_type: string;
    is_online?: boolean;
  };
  lastMessage: {
    content: string;
    created_at: Date;
    sender_id: number;
  } | null;
  unreadCount: number;
}

export class MessageService {
  /**
   * Get all conversations for a user with unread counts and last message
   */
  static async getConversations(userId: number): Promise<ConversationWithDetails[]> {
    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: {
        users_conversations_user1_idTousers: { 
          select: { 
            id: true, 
            first_name: true, 
            last_name: true, 
            avatar_url: true,
            company_name: true,
            user_type: true,
            last_login: true
          } 
        },
        users_conversations_user2_idTousers: { 
          select: { 
            id: true, 
            first_name: true, 
            last_name: true, 
            avatar_url: true,
            company_name: true,
            user_type: true,
            last_login: true
          } 
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            created_at: true,
            sender_id: true,
          }
        },
      },
      orderBy: { last_message_at: 'desc' },
    });

    // Get unread counts for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1_id === userId 
          ? conv.users_conversations_user2_idTousers 
          : conv.users_conversations_user1_idTousers;

        const unreadCount = await prisma.messages.count({
          where: {
            conversation_id: conv.id,
            sender_id: { not: userId },
            is_read: false,
          },
        });

        // Check if user is online (last login within 5 minutes)
        const isOnline = otherUser.last_login 
          ? new Date().getTime() - new Date(otherUser.last_login).getTime() < 5 * 60 * 1000
          : false;

        return {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          created_at: conv.created_at!,
          last_message_at: conv.last_message_at,
          otherUser: {
            id: otherUser.id,
            first_name: otherUser.first_name,
            last_name: otherUser.last_name,
            avatar_url: otherUser.avatar_url,
            company_name: otherUser.company_name,
            user_type: otherUser.user_type,
            is_online: isOnline,
          },
          lastMessage: conv.messages[0] ? {
            content: conv.messages[0].content,
            created_at: conv.messages[0].created_at!,
            sender_id: conv.messages[0].sender_id,
          } : null,
          unreadCount,
        };
      })
    );

    return conversationsWithDetails;
  }

  /**
   * Get messages for a specific conversation
   */
  static async getMessages(conversationId: number, userId: number, page: number = 1, limit: number = 50) {
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      throw new Error('Yetkiniz yok veya konuşma bulunamadı');
    }

    const offset = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.messages.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        include: { 
          users: { 
            select: { 
              id: true, 
              first_name: true, 
              last_name: true,
              avatar_url: true 
            } 
          } 
        },
      }),
      prisma.messages.count({ where: { conversation_id: conversationId } }),
    ]);

    // Mark messages as read
    await prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true, read_at: new Date() },
    });

    // Get other user info
    const otherUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;
    const otherUser = await prisma.users.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        company_name: true,
        user_type: true,
        last_login: true,
      },
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + messages.length < total,
      },
      conversation: {
        id: conversation.id,
        otherUser: {
          ...otherUser,
          is_online: otherUser?.last_login 
            ? new Date().getTime() - new Date(otherUser.last_login).getTime() < 5 * 60 * 1000
            : false,
        },
      },
    };
  }

  /**
 * Send a message
 */
static async sendMessage(
  senderId: number, 
  receiverId: number, 
  content: string,
  options?: { message_type?: 'text' | 'image' | 'file'; file_url?: string }
) {
  if (senderId === receiverId) {
    throw new Error('Kendinize mesaj gönderemezsiniz');
  }

  // Validate receiver exists
  const receiver = await prisma.users.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    throw new Error('Alıcı bulunamadı');
  }

  // Find or create conversation
  let conversation = await prisma.conversations.findFirst({
    where: {
      OR: [
        { user1_id: senderId, user2_id: receiverId },
        { user1_id: receiverId, user2_id: senderId },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversations.create({
      data: {
        user1_id: senderId,
        user2_id: receiverId,
        last_message_at: new Date(),
      },
    });
  }

  const message = await prisma.messages.create({
    data: {
      conversation_id: conversation.id,
      sender_id: senderId,
      content,
      message_type: options?.message_type || 'text',
      file_url: options?.file_url,
      is_read: false,
    },
    include: {
      users: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
    },
  });

  // Update conversation last_message_at
  await prisma.conversations.update({
    where: { id: conversation.id },
    data: { last_message_at: new Date() },
  });

  // TODO: Create notification for receiver when enum values are confirmed
  // await prisma.notifications.create({
  //   data: {
  //     user_id: receiverId,
  //     type: 'message',
  //     title: 'Yeni Mesaj',
  //     message: `${message.users.first_name} ${message.users.last_name} size mesaj gönderdi`,
  //     related_user_id: senderId,
  //     is_read: false,
  //     is_sent: false,
  //     created_at: new Date(),
  //   },
  // });

  return message;
}

  /**
   * Mark messages as read
   */
  static async markAsRead(conversationId: number, userId: number) {
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      throw new Error('Yetkiniz yok');
    }

    const updated = await prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true, read_at: new Date() },
    });

    return { markedAsRead: updated.count };
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(messageId: number, userId: number) {
    const message = await prisma.messages.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Mesaj bulunamadı');
    }

    if (message.sender_id !== userId) {
      throw new Error('Sadece kendi mesajlarınızı silebilirsiniz');
    }

    // Check if message was sent within 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.created_at! < fifteenMinutesAgo) {
      throw new Error('15 dakikadan eski mesajları silemezsiniz');
    }

    await prisma.messages.delete({ where: { id: messageId } });

    return { deleted: true };
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: number) {
    const count = await prisma.messages.count({
      where: {
        conversations: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
        sender_id: { not: userId },
        is_read: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Start a new conversation (e.g., from a project page)
   */
  static async startConversation(userId: number, receiverId: number, initialMessage: string) {
    if (userId === receiverId) {
      throw new Error('Kendinize mesaj gönderemezsiniz');
    }

    // Check if conversation already exists
    let conversation = await prisma.conversations.findFirst({
      where: {
        OR: [
          { user1_id: userId, user2_id: receiverId },
          { user1_id: receiverId, user2_id: userId },
        ],
      },
    });

    const isNew = !conversation;

    if (!conversation) {
      conversation = await prisma.conversations.create({
        data: {
          user1_id: userId,
          user2_id: receiverId,
          last_message_at: new Date(),
        },
      });
    }

    // Send the initial message
    const message = await this.sendMessage(userId, receiverId, initialMessage);

    return {
      conversation,
      message,
      isNewConversation: isNew,
    };
  }

  /**
   * Search messages
   */
  static async searchMessages(userId: number, query: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const messages = await prisma.messages.findMany({
      where: {
        conversations: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      include: {
        users: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
        conversations: {
          include: {
            users_conversations_user1_idTousers: { select: { id: true, first_name: true, last_name: true } },
            users_conversations_user2_idTousers: { select: { id: true, first_name: true, last_name: true } },
          },
        },
      },
    });

    return { messages };
  }
}
