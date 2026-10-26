import { useEffect, useRef } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router'
import page from './experience.html?raw'
import { initExperience } from './main.js'
import { CarePage, IntroPage, NotFoundPage, DemoProvider } from './pages'

function LandingPage() {
  const container = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    window.scrollTo(0, 0)
    if (container.current) return initExperience(container.current, navigate)
  }, [navigate])
  return <div ref={container} dangerouslySetInnerHTML={{ __html: page }} />
}

const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/intro', Component: IntroPage },
  ...['patient', 'doctor', 'admin', 'appointments', 'triage', 'pharmacy', 'consultation', 'records', 'directory', 'claims', 'privacy', 'contact'].map(path => ({ path: `/${path}`, Component: CarePage })),
  ...['hospitals', 'hospitals/:id', 'doctors', 'doctors/:id', 'medicines', 'medicines/:id', 'cart', 'checkout', 'orders', 'orders/:id', 'prescriptions', 'profile', 'notifications', 'login', 'register'].map(path => ({ path: `/${path}`, Component: CarePage })),
  { path: '*', Component: NotFoundPage },
])

export default function App() {
  return <DemoProvider><RouterProvider router={router} /></DemoProvider>
}
