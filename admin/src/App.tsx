import { useState } from 'react';
import LoginGate from './components/LoginGate';
import StudioList from './components/StudioList';
import StudioForm from './components/StudioForm';
import type { Studio } from './types/studio';

type View = { page: 'list' } | { page: 'form'; studio?: Studio };

export default function App() {
  const [view, setView] = useState<View>({ page: 'list' });

  const navigateToList = () => setView({ page: 'list' });
  const navigateToCreate = () => setView({ page: 'form' });
  const navigateToEdit = (studio: Studio) => setView({ page: 'form', studio });

  return (
    <LoginGate>
      <div className="min-h-screen bg-brand-offWhite">
        <header className="bg-brand-darkBrown text-white px-6 py-4 flex items-center justify-between">
          <button onClick={navigateToList} className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">Offseason Admin</h1>
          </button>
          {view.page === 'list' && (
            <button
              onClick={navigateToCreate}
              className="px-4 py-2 bg-brand-yellow text-brand-darkBrown font-semibold
                         rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              + Add Studio
            </button>
          )}
          {view.page === 'form' && (
            <button
              onClick={navigateToList}
              className="px-4 py-2 bg-white/10 text-white font-medium
                         rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Back to List
            </button>
          )}
        </header>

        <main className="max-w-6xl mx-auto p-6">
          {view.page === 'list' && (
            <StudioList onEdit={navigateToEdit} />
          )}
          {view.page === 'form' && (
            <StudioForm
              studio={view.studio}
              onSaved={navigateToList}
              onCancel={navigateToList}
            />
          )}
        </main>
      </div>
    </LoginGate>
  );
}
