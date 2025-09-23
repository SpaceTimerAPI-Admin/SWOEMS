import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './App'
import SignIn from './auth/SignIn'
import Register from './auth/Register'
import Home from './routes/Home'
import Tickets from './routes/Tickets'
import Projects from './routes/Projects'
import ParkMap from './routes/ParkMap'
import Procedures from './routes/Procedures'

const router = createBrowserRouter([
  { path: '/', element: <SignIn /> },
  { path: '/register', element: <Register /> },
  {
    path: '/app',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'projects', element: <Projects /> },
      { path: 'map', element: <ParkMap /> },
      { path: 'procedures', element: <Procedures /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
