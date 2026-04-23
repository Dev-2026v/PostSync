import AuthGuard from './components/AuthGuard'
import Dashboard from './components/Dashboard'  

export default function App() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}