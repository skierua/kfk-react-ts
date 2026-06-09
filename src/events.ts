// Описуємо типи даних для кожної події
export type AppEvents = {
  userChanged: string; // Base64 рядок з обліковими даними
  userLogout: null; // Подія виходу без даних
};

// Типізований слухач
type EventListener<K extends keyof AppEvents> = (data: AppEvents[K]) => void;

function subscribe<K extends keyof AppEvents>(
  eventName: K,
  listener: EventListener<K>,
) {
  const wrapper = (event: Event) => {
    const customEvent = event as CustomEvent<AppEvents[K]>;
    listener(customEvent.detail);
  };

  // Зберігаємо посилання на wrapper, якщо потрібно відписуватись
  (listener as any)._wrapper = wrapper;
  document.addEventListener(eventName, wrapper);
}

function unsubscribe<K extends keyof AppEvents>(
  eventName: K,
  listener: EventListener<K>,
) {
  const wrapper = (listener as any)._wrapper;
  if (wrapper) {
    document.removeEventListener(eventName, wrapper);
  }
}

function publish<K extends keyof AppEvents>(eventName: K, data: AppEvents[K]) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
