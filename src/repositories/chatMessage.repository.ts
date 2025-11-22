import { ChatMessage } from '@prisma/client';
import prisma from '../infrastructure/database.js';
import { CreateMessageDTO, UpdateMessageDTO } from '../validators/index.js';

export class ChatMessageRepository {
  async findAll(): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<ChatMessage | null> {
    return prisma.chatMessage.findUnique({
      where: { id },
    });
  }

  async create(username: string, data: CreateMessageDTO): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        username,
        message: data.message,
      },
    });
  }

  async update(id: string, username: string, data: UpdateMessageDTO): Promise<ChatMessage | null> {
    return prisma.chatMessage.update({
      where: { id },
      data: {
        username,
        message: data.message,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<ChatMessage> {
    return prisma.chatMessage.delete({
      where: { id },
    });
  }
}

export default new ChatMessageRepository();
