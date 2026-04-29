import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Layout() {
  const { user, logout, loading } = useAuth()

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b hairline bg-paper/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="display text-2xl font-semibold text-maroon">SCIS</span>
            <span className="text-xs text-ink/60 hidden sm:inline">School of Computer &amp; Information Sciences</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-maroon">Directory</Link>
            <a className="hover:text-maroon hidden sm:inline" href="#">Research</a>
            <a className="hover:text-maroon hidden sm:inline" href="#">Admissions</a>
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <Link to={`/faculty/${user.faculty_id}/edit`} className="text-maroon hover:underline">Edit my profile</Link>
                  <button onClick={logout} className="text-xs text-ink/50 hover:text-maroon">Sign out</button>
                </div>
              ) : (
                <Link to="/login" className="text-xs text-ink/50 hover:text-maroon">Faculty sign in</Link>
              )
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="border-t hairline mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-ink/50 flex justify-between">
          <span>SCIS Hyderabad</span>
          <span>Faculty Directory · 2026</span>
        </div>
      </footer>
    </div>
  )
}