import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const NEED_EMAIL_VERIFY = 'needEmailVerify';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const VerifyEmail = () => SetMetadata(NEED_EMAIL_VERIFY, true);
