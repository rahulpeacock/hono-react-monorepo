import { Resend } from 'resend';
import { env } from './env';

export const resend = new Resend(env.EMAIL_SERVICE_API_KEY);
