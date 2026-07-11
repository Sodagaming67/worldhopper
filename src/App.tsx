import { Router } from 'wouter'
import { AppRouter } from './app/router'
import { SettingsEffects } from './app/providers'

// Vite injects BASE_URL from vite.config.ts `base` (e.g. "/worldhopper/").
// wouter expects a base without a trailing slash, so strip it.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <Router base={base}>
      <SettingsEffects>
        <AppRouter />
      </SettingsEffects>
    </Router>
  )
}
