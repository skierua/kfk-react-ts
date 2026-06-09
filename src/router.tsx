import { createBrowserRouter } from 'react-router-dom';
import { Main as PubMain } from './pagePub/Main';
import { Main as BrdMain } from './pageBoard/Main';
import { Main as AdmMain } from './pageAdm/Main';
// import { Layout } from './share/Layout';
import { VkError } from './share/VkError';
// import { Sign } from './Sign';

export const router = createBrowserRouter([
  {
    path: '/',
    // element: <Layout />, // pages wraper
    errorElement: <VkError />,
    children: [
      {
        index: true, // root "/"
        element: <PubMain />,
      },
      {
        path: 'board',
        element: <BrdMain />,
      },
      {
        path: 'adm',
        element: <AdmMain />,
      },
      // {
      //   path: 'offer/:id', // Динамічний маршрут
      //   element: <div />, // Ваш компонент для деталей
      // },
    ],
  },
]);
