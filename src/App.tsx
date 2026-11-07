import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { NavigationTabs, ActiveTab } from './components/common/NavigationTabs';
import { DashboardView } from './components/dashboard/DashboardView';
import { RunningTracker } from './components/running/RunningTracker';
import { HomeWorkoutView } from './components/home/HomeWorkoutView';
import { AbsChallengeView } from './components/abs/AbsChallengeView';
import { GymWorkoutView } from './components/gym/GymWorkoutView';
import { SyncCenterModal } from './components/sync/SyncCenterModal';
import { FamilyProfilesModal } from './components/auth/FamilyProfilesModal';
import { UserProfile } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [userSessionKey, setUserSessionKey] = useState(0);

  const handleProfileSwitched = (_user: UserProfile) => {
    // Re-trigger re-render of components using partitioned IndexedDB storage
    setUserSessionKey((prev) => prev + 1);
  };

  return (
    <div key={userSessionKey} className="min-h-screen bg-industrial-900 text-slate-100 flex flex-col font-industrial">
      {/* Top Header */}
      <Header
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenProfiles={() => setIsProfilesModalOpen(true)}
      />

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

        {activeTab === 'home' && <HomeWorkoutView />}

        {activeTab === 'abs' && <AbsChallengeView />}

        {activeTab === 'gym' && <GymWorkoutView />}
      </main>

      {/* Fixed Mobile Dock Bottom Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* GloryFit / Linwear & Smartwatch Sync Modal */}
      <SyncCenterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onRunImported={() => {
          setActiveTab('dashboard');
        }}
      />

      {/* Family Multi-User Profiles & Password Modal */}
      <FamilyProfilesModal
        isOpen={isProfilesModalOpen}
        onClose={() => setIsProfilesModalOpen(false)}
        onProfileSwitched={handleProfileSwitched}
      />
    </div>
  );
}

export default App;
