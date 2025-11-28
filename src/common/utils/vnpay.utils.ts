// src/common/vnpay.util.ts
import * as crypto from 'crypto';

export function sortObject(obj: Record<string, any>) {
  const sorted: Record<string, any> = {};
  Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
    .sort() // sort A→Z
    .forEach((key) => (sorted[key] = obj[key]));
  return sorted;
}

// encode key & value như VNPay yêu cầu (space -> %20; không dùng '+')
export function buildQueryToSign(params: Record<string, any>) {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export function hmacSHA512(secret: string, data: string) {
  return crypto.createHmac('sha512', secret).update(data, 'utf8').digest('hex');
}
