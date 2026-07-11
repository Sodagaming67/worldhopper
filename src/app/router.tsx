import { Route, Switch } from 'wouter';
import { AppShell } from '@/components/ui/AppShell';
import { IslandMapScreen } from '@/features/arcade/IslandMapScreen';
import { WorldScreen } from '@/features/arcade/WorldScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

export function AppRouter() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={IslandMapScreen} />
        {/* Legacy alias — deep links and e2e specs still target /map */}
        <Route path="/map" component={IslandMapScreen} />
        <Route path="/world/:worldId" component={WorldScreen} />
        <Route path="/settings" component={SettingsScreen} />
        <Route>
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-display)' }}>404</h1>
            <p>Page not found.</p>
            <a href="/" className="text-[var(--color-ocean-deep)] underline">Go home</a>
          </div>
        </Route>
      </Switch>
    </AppShell>
  );
}
