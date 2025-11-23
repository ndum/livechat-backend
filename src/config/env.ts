import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().min(32),
    URL: z.string().optional(),
    DOCKER: z.string().optional(),
    BEHIND_PROXY: z.string().optional().default('false'),
});

export const validateEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const missingVars = parsed.error.issues
            .map(issue => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        throw new Error(`❌ Invalid environment variables:\n${missingVars}`);
    }

    return parsed.data;
};

let cachedEnv: z.infer<typeof envSchema> | null = null;

export const getEnv = () => {
    if (!cachedEnv) {
        cachedEnv = validateEnv();
    }
    return cachedEnv;
};