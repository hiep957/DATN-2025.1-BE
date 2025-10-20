import { Request } from 'express';

// Lấy "Bearer xxx" từ header Authorization
export function extractBearerToken(req: Request): string | null {
    const auth = req.headers['authorization'];
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    if (type?.toLowerCase() !== 'bearer' || !token) return null;
    return token;
}
