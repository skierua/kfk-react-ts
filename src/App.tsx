import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { GlobalSnackbar } from './share/GlobalSnackbar';
import './App.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalSnackbar />
    </>
  );
}

export default App;
