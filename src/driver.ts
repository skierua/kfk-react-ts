import { APP_CONFIG } from './const.ts';
import { useUserStore } from './store/useUserStore';
const serverUrl = APP_CONFIG.SERVER_URL;
const apiUrl = APP_CONFIG.API_URL;

async function getData<T>(path: string, query?: string | null): Promise<T> {
  // const token = useUserStore.getState().token; // Беремо токен зі стору
  const url = `${serverUrl}${apiUrl}${path}${query ? `?${query}` : ''}`;

  const resp = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      // Authorization: `Bearer ${token}`,
      // 'Content-Type': 'application/json; charset=UTF-8', // doen't work with GET
      // 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  });

  if (!resp.ok) {
    throw new Error(`Fetch error: ${resp.status}`);
  }

  const jresp = await resp.json();
  return jresp.rslt as T;
}

async function postData<T>(path: string, data: string): Promise<T> {
  const token = useUserStore.getState().token;
  const showNotification = useUserStore.getState().showNotification;
  const url = `${serverUrl}${apiUrl}${path}`;
  // const url = `${serverUrl}${apiUrl}${path}?api_token=${encodeURIComponent(token ?? '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      // credentials: 'include', // КРИТИЧНО ДЛЯ SAFARI при Allow-Credentials: true
      headers,
      body: 'data=' + encodeURIComponent(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        useUserStore.getState().logout();
        showNotification('Сесію завершено. Увійдіть знову', 'warning');
      } else if (response.status === 400) {
        showNotification('Некоректний запит до сервера', 'error');
      } else {
        showNotification('Критична помилка сервера (500)', 'error');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jresp = await response.json();

    if (jresp.status !== 0) {
      showNotification(jresp.str || 'Помилка обробки даних', 'error');
      throw new Error(jresp.str);
    }

    return jresp.rslt as T;
  } catch (error: any) {
    // console.error(`#eww4 postData fetch error response: ${error.message}`);
    if (error.message.includes('Failed to fetch')) {
      showNotification(
        "Відсутній зв'язок із сервером. Перевірте інтернет",
        'error',
      );
    }
    throw error;
  }
}

interface AuthResponse {
  token: string;
  errstr: string;
}

async function authFetch(usrBase64: string): Promise<string> {
  const resp = await fetch(`${serverUrl}${apiUrl}/auth`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `data=${encodeURIComponent(usrBase64)}`,
  });

  if (!resp.ok) {
    throw new Error(`Fetch error: ${resp.status}`);
  }

  const jresp: AuthResponse = await resp.json();
  if (jresp.token) {
    return jresp.token;
  }
  // console.log(`#836f authFetch received response: ${jresp.token}`);
  return '';
}

export { getData, authFetch, postData };
