
import React from 'react';
import { Typography, Card, Button } from '../components/DesignSystem';
import { Event, VisionItem } from '../types';
import { Language } from '../locales';

interface DashboardProps {
  events: Event[];
  visionItems: VisionItem[];
  t: any;
  lang: Language;
}

// Fixed: Added lang to props to match what is passed from App.tsx
const Dashboard: React.FC<DashboardProps> = ({ events, visionItems, t, lang }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section>
          <div className="flex justify-between items-end mb-6">
            <Typography variant="h2">{t.dashboard.aura_guide}</Typography>
            <button className="text-lumina-500 text-sm hover:underline">{t.nav.calendar}</button>
          </div>
          <div className="grid gap-4">
            {events.length > 0 ? events.map(event => (
              <Card key={event.id} className="flex items-center gap-6 group hover:border-lumina-300 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-accent-sage flex items-center justify-center text-emerald-700">
                  {event.type === 'social' ? '✨' : '🧘'}
                </div>
                <div className="flex-1">
                  <Typography variant="h3">{event.title}</Typography>
                  <Typography variant="small" className="uppercase tracking-widest text-[10px]">10:00 AM — {event.type}</Typography>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm">{t.common.edit}</Button>
                </div>
              </Card>
            )) : (
              <Card className="text-center py-10 opacity-60">
                <Typography>{t.dashboard.no_plans}</Typography>
              </Card>
            )}
          </div>
        </section>

        <section>
          <Typography variant="h2" className="mb-6">{t.dashboard.recent_manifestations}</Typography>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visionItems.length > 0 ? visionItems.slice(0, 3).map(item => (
              <div key={item.id} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
              </div>
            )) : [1,2,3].map(i => (
              <div key={i} className="aspect-square rounded-2xl bg-lumina-100 flex items-center justify-center border-2 border-dashed border-lumina-200 text-center p-4">
                <Typography variant="small">Manifestação {i}</Typography>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <Card className="bg-lumina-900 text-white relative overflow-hidden">
          <Typography variant="h2" className="text-white mb-4 !font-normal italic">Aura Assistant</Typography>
          <Button variant="secondary" fullWidth className="!bg-white !text-lumina-900">{t.dashboard.ask_ai}</Button>
        </Card>

        <Card>
          <Typography variant="h3" className="mb-4">{t.dashboard.todays_mood}</Typography>
          <div className="flex justify-between">
            {['✨', '☁️', '🌙', '🌊', '🌸'].map((emoji, i) => (
              <button key={i} className="w-10 h-10 rounded-full hover:bg-lumina-50 transition-colors flex items-center justify-center text-xl">{emoji}</button>
            ))}
          </div>
        </Card>

        <Card className="bg-accent-lavender/30">
          <Typography variant="h3" className="mb-2">{t.dashboard.journal_prompt}</Typography>
          <Typography variant="body" className="text-sm mb-4">"Qual a cor da sua energia hoje?"</Typography>
          <Button variant="ghost" size="sm" className="p-0 underline">Responder</Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
