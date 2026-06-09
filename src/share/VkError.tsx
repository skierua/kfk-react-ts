import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export const VkError = () => {
  const error = useRouteError();
  console.error(error);

  let errorMessage = 'Сталася непередбачена помилка';

  if (isRouteErrorResponse(error)) {
    // HTTP error (404, 500)
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    // JS Error object
    errorMessage = error.message;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Упс! Щось пішло не так 😵‍💫</h1>
      <p style={{ color: 'red' }}>{errorMessage}</p>
      <Link to="/">Повернутися на головну</Link>
    </div>
  );
};
