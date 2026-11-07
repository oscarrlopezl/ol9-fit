import React from 'react';
import { LayoutDashboard, Activity, Award, Dumbbell, Home } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'running' | 'home' | 'abs' | 'gym';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      sublabel: 'Calendario',
      icon: LayoutDashboard,
    },
    {
      id: 'running' as ActiveTab,
      label: 'Running',
      sublabel: 'OL9 Track',
      icon: Activity,
    },
    {
      id: 'home' as ActiveTab,
      label: 'En Casa',
      sublabel: 'Calistenia',
      icon: Home,
    },
    {
      id: 'abs' as ActiveTab,
      label: 'Abdomen',
      sublabel: 'Reto 30D',
      icon: Award,
    },
    {
      id: 'gym' as ActiveTab,
      label: 'Gimnasio',
      sublabel: 'Modo FST-7',
      icon: Dumbbell,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-industrial-950/95 backdrop-blur-xl border-t border-industrial-800/90 px-2 py-2 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all ${
                isActive
                  ? 'bg-industrial-850/90 text-lime-accent border border-lime-accent/30 shadow-lime-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-900/60'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold leading-none truncate max-w-full">
                {tab.label}
              </span>
              <span className={`text-[8px] sm:text-[9px] font-mono leading-tight mt-0.5 truncate max-w-full ${isActive ? 'text-lime-accent' : 'text-slate-500'}`}>
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
