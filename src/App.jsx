import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Journal from './components/Journal';
import AddMeal from './components/AddMeal';
import Favorites from './components/Favorites';
import Sport from './components/Sport';
import Recap from './components/Recap';
import Profile from './components/Profile';
import { loadProfile, loadDay, saveDay, mergeSupplements, getDefaultSupplements } from './utils/storage';

const TABS = [
  { id: 'journal', icon: '📋', label: 'Journal' },
  { id: 'add', icon: '✏️', label: 'Ajouter' },
  { id: 'favs', icon: '⭐', label: 'Favoris' },
  { id: 'sport', icon: '🏋️', label: 'Sport' },
  { id: 'recap', icon: '📊', label: 'Récap' },
  { id: 'profile', icon: '⚙️', label: 'Profil' },
];

function today() { return new Date().toISOString().slice(0, 10); }

function formatHeaderDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function App() {
  const [appState, setAppState] = useState(null);
  const [tab, setTab] = useState('journal');
  const [dayData, setDayData] = useState(null);

  useEffect(() => {
    try {
      const stored = loadProfile();
      const storedTargets = localStorage.getItem('nh_targets_v2');
      const targets = storedTargets ? JSON.parse(storedTargets) : null;
      if (stored) {
        setAppState({ profile: stored, targets });
      } else {
        setAppState({ profile: null, targets: null });
      }
    } catch(e) {
      setAppState({ profile: null, targets: null });
    }
  }, []);

  useEffect(() => {
    if (!appState?.profile) return;
    const d = loadDay(today());
    d.supplements = mergeSupplements(d.supplements || getDefaultSupplements());
    setDayData(d);
  }, [appState?.profile]);

  const handleUpdateDay = (updated) => {
    setDayData(updated);
    saveDay(today(), updated);
  };

  const handleAddMealToJournal = (meal) => {
    if (!dayData) return;
    const updated = { ...dayData, meals: [...(dayData.meals || []), meal], summary: '' };
    handleUpdateDay(updated);
    setTab('journal');
  };

  const handleUpdateAppState = (newState) => {
    try {
      localStorage.setItem('nh_profile_v2', JSON.stringify(newState.profile));
      localStorage.setItem('nh_targets_v2', JSON.stringify(newState.targets));
    } catch(e) {}
    setAppState({ ...newState });
    // Load day data immediately after profile is set
    const d = loadDay(today());
    d.supplements = mergeSupplements(d.supplements || getDefaultSupplements());
    setDayData(d);
  };

  if (appState === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#f0ede6' }}>
        nutri<span style={{ color: '#c8f562' }}>.</span>hyrox
      </div>
    </div>
  );

  if (!appState.profile) {
    return <Onboarding onDone={handleUpdateAppState} />;
  }

  if (!dayData) return null;

  const { profile, targets } = appState;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 20px 16px', borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
          nutri<span style={{ color: '#c8f562' }}>.</span>hyrox
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 2, fontWeight: 300, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {formatHeaderDate()}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(70px + var(--safe-bottom))' }}>
        {tab === 'journal' && <Journal dayData={dayData} targets={targets} profile={profile} onUpdateDay={handleUpdateDay} onNavigateAdd={() => setTab('add')} />}
        {tab === 'add' && <AddMeal onAdd={handleAddMealToJournal} />}
        {tab === 'favs' && <Favorites onAddToJournal={handleAddMealToJournal} />}
        {tab === 'sport' && <Sport />}
        {tab === 'recap' && <Recap profile={profile} targets={targets} />}
        {tab === 'profile' && <Profile profile={profile} targets={targets} onUpdate={handleUpdateAppState} />}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#111', borderTop: '1px solid #2a2a2a', display: 'flex', zIndex: 20, paddingBottom: 'var(--safe-bottom)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 12px', border: 'none', background: 'none', color: tab === t.id ? '#c8f562' : '#555', fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 500, cursor: 'pointer', gap: 4, transition: 'color 0.2s', letterSpacing: '0.3px' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
