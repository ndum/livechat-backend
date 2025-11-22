import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(1000),
  }),
});

export const updateMessageSchema = z.object({
  params: z.object({
    id: z.string().length(24), // MongoDB ObjectId length
  }),
  body: z.object({
    message: z.string().min(1).max(1000),
  }),
});

export const getMessageSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

export type CreateMessageDTO = z.infer<typeof createMessageSchema>['body'];
export type UpdateMessageDTO = z.infer<typeof updateMessageSchema>['body'];
