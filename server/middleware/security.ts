import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateURL = (url: string): { valid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL non fornito' };
  }

  if (!validator.isURL(url, { require_protocol: false })) {
    return { valid: false, error: 'URL non valido' };
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    const urlObj = new URL(normalizedUrl);

    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return { valid: false, error: 'Localhost non consentito (SSRF protection)' };
    }

    const privateIPPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];

    if (privateIPPatterns.some(pattern => pattern.test(urlObj.hostname))) {
      return { valid: false, error: 'IP privati non consentiti (SSRF protection)' };
    }

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Solo HTTP/HTTPS consentiti' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'URL malformato' };
  }
};

export const sanitizeHTML = (html: string): string => {
  return html;
};
