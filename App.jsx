import AdminPanel from './admin-panel'
import StudentApp from './cet-mock-test'

export default function App() {
  const path = window.location.pathname
  if (path.startsWith('/admin')) return <AdminPanel />
  return <StudentApp />
}
