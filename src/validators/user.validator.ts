import { z } from 'zod';

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    password: z.string().min(8).max(100).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
