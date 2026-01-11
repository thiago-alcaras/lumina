
import React, { useState, useEffect } from 'react';
import { View, Outfit, VisionItem, Event } from './types';
import { ICONS, COLORS } from './constants';
import { Button, Typography, Card } from './components/DesignSystem';
import { translations, Language } from './locales';
import { db } from './services/persistenceService';

// Views
import Dashboard from './features/Dashboard';
import CalendarView from './features/CalendarView';
import Registry from './features/Registry';
import VisionBoard from './features/VisionBoard';
import Journal from './features/Journal';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('pt');
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const t = translations[lang];

  useEffect(() => {
    const loadData = async () => {
      const savedOutfits = await db.outfits.getAll();
      const savedVision = await db.vision.getAll();
      const savedEvents = await db.events.getAll();
      
      setOutfits(savedOutfits.length ? savedOutfits : [
        { id: '1', name: 'Picnic de Primavera', category: 'casual', image: 'https://picsum.photos/seed/outfit1/400/600', dateAdded: new Date().toISOString() }
      ]);
      setVisionItems(savedVision);
      setEvents(savedEvents.length ? savedEvents : [
        { id: '1', title: 'Café com Sarah', date: new Date().toISOString().split('T')[0], type: 'social' }
      ]);
    };
    loadData();
  }, []);

  // Save triggers
  useEffect(() => { db.outfits.save(outfits); }, [outfits]);
  useEffect(() => { db.vision.save(visionItems); }, [visionItems]);
  useEffect(() => { db.events.save(events); }, [events]);

  const renderView = () => {
    const props = { t, lang };
    switch (activeView) {
      case 'dashboard': return <Dashboard events={events} visionItems={visionItems} {...props} />;
      case 'calendar': return <CalendarView events={events} setEvents={setEvents} {...props} />;
      case 'registry': return <Registry outfits={outfits} setOutfits={setOutfits} {...props} />;
      case 'vision-board': return <VisionBoard items={visionItems} setItems={setVisionItems} {...props} />;
      case 'journal': return <Journal {...props} />;
      default: return <Dashboard events={events} visionItems={visionItems} {...props} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-lumina-50">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-24 lg:w-64 bg-white md:min-h-screen border-t md:border-t-0 md:border-r border-lumina-100 flex md:flex-col justify-around md:justify-start items-center md:items-stretch p-2 md:p-6 shadow-2xl md:shadow-none">
        <div className="hidden md:flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-rose flex items-center justify-center">
              <span className="text-lumina-900 font-serif font-bold italic">L</span>
            </div>
            <Typography variant="h2" className="hidden lg:block !text-xl tracking-tight">Lumina</Typography>
          </div>
        </div>

        <div className="flex md:flex-col w-full gap-2 lg:gap-4">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<ICONS.Dashboard />} label={t.nav.dashboard} />
          <NavItem active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<ICONS.Calendar />} label={t.nav.calendar} />
          <NavItem active={activeView === 'registry'} onClick={() => setActiveView('registry')} icon={<ICONS.Registry />} label={t.nav.registry} />
          <NavItem active={activeView === 'vision-board'} onClick={() => setActiveView('vision-board')} icon={<ICONS.Vision />} label={t.nav.vision} />
          <NavItem active={activeView === 'journal'} onClick={() => setActiveView('journal')} icon={<ICONS.Journal />} label={t.nav.journal} />
        </div>

        <div className="mt-auto hidden md:flex flex-col gap-4">
          <div className="flex items-center justify-center lg:justify-start gap-2 px-2">
             <button onClick={() => setLang('pt')} className={`text-xs font-bold ${lang === 'pt' ? 'text-lumina-900 underline' : 'text-lumina-400'}`}>PT</button>
             <span className="text-lumina-200">|</span>
             <button onClick={() => setLang('en')} className={`text-xs font-bold ${lang === 'en' ? 'text-lumina-900 underline' : 'text-lumina-400'}`}>EN</button>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-4 p-4 rounded-2xl bg-lumina-50 border border-lumina-100">
            <div className="w-10 h-10 rounded-full bg-lumina-200" />
            <div className="hidden lg:block">
              <Typography variant="small" className="font-bold">Sophie Miller</Typography>
              <Typography variant="small" className="text-xs">{t.common.premium}</Typography>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <header className="p-6 md:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Typography variant="h1" className="mb-2">{t.dashboard.greeting}</Typography>
            <Typography variant="body" className="italic opacity-80 font-serif">"{t.dashboard.quote}"</Typography>
          </div>
          <div className="flex gap-4 items-center">
            <div className="md:hidden flex gap-2 mr-4">
               <button onClick={() => setLang('pt')} className={`text-xs font-bold ${lang === 'pt' ? 'text-lumina-900 underline' : 'text-lumina-400'}`}>PT</button>
               <button onClick={() => setLang('en')} className={`text-xs font-bold ${lang === 'en' ? 'text-lumina-900 underline' : 'text-lumina-400'}`}>EN</button>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <ICONS.Search /> {t.common.search}
            </Button>
          </div>
        </header>

        <div className="px-6 md:px-10 pb-10">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 group
      ${active ? 'bg-accent-rose text-lumina-900 shadow-sm' : 'text-lumina-400 hover:text-lumina-600 hover:bg-lumina-50'}`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="text-[10px] md:text-sm font-medium lg:block hidden">{label}</span>
    <span className="text-[10px] md:hidden">{label}</span>
  </button>
);

export default App;
