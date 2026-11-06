import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { NavigationTabs, ActiveTab } from './components/common/NavigationTabs';
import { DashboardView } from './components/dashboard/DashboardView';
import { RunningTracker } from './components/running/RunningTracker';
import { AbsChallengeView } from './components/abs/AbsChallengeView';
import { GymWorkoutView } from './components/gym/GymWorkoutView';
import { SyncCenterModal } from './components/sync/SyncCenterModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-industrial-900 text-slate-100 flex flex-col font-industrial">
      {/* Top Header */}
      <Header onOpenSync={() => setIsSyncModalOpen(true)} />

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={(tab) => {
              if (tab === 'sync') {
                setIsSyncModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'running' && <RunningTracker />}

        {activeTab === 'abs' && <AbsChallengeView />}

        {activeTab === 'gym' && <GymWorkoutView />}
      </main>

      {/* Fixed Mobile Dock Bottom Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Sincronización Modal (Strava, Bluetooth HR & Chinese Smartwatch Parsers) */}
      <SyncCenterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onRunImported={() => {
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}

export default App;
