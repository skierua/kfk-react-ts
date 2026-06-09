import { type AppUser } from '../store/DbTypes';
export interface JwtPayloadType {
  crntuser: string;
  term: string;
  role: string;
  user: string;
  exp?: number; // якщо додасте час дії на сервері
}

export function parseJwt(token: string | null): AppUser | null {
  if (!token) return null;

  try {
    // JWT складається з 3 частин, розділених крапкою: Header.Payload.Signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    // Замінюємо безпечні символи base64url назад на стандартний Base64
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Відновлюємо символи заповнення (=), якщо їх довжина не кратна 4
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) return null;
      base64 += new Array(5 - pad).join('=');
    }

    // Розкодуємо рядок враховуючи можливі UTF-8 символи (наприклад, кирилицю в іменах)
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as AppUser;
  } catch (error) {
    console.error('Помилка парсингу JWT-токена:', error);
    return null;
  }
}
