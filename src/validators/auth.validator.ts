import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
});

export type RegisterDTO = z.infer<typeof registerSchema>['body'];
export type LoginDTO = z.infer<typeof loginSchema>['body'];
