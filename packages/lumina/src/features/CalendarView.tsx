
import React from 'react';
import { Typography, Card, Button } from '../components/DesignSystem';
import { Event } from '../types';
import { Language } from '../locales';

interface CalendarProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  t: any;
  lang: Language;
}

// Fixed: Added t and lang to props to match what is passed from App.tsx
const CalendarView: React.FC<CalendarProps> = ({ events, setEvents, t, lang }) => {
  const daysInMonth = 31;
  const currentMonth = lang === 'pt' ? "Maio 2024" : "May 2024";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h2">{currentMonth}</Typography>
          <Typography variant="body">{lang === 'pt' ? 'Seu ritmo para este mês.' : 'Your rhythm for this month.'}</Typography>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">{lang === 'pt' ? 'Anterior' : 'Previous'}</Button>
          <Button variant="outline" size="sm">{lang === 'pt' ? 'Próximo' : 'Next'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center py-2">
            <Typography variant="small" className="uppercase tracking-widest font-bold !text-[10px]">{day}</Typography>
          </div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const hasEvent = events.some(e => e.date.includes(`-${dayNum.toString().padStart(2, '0')}`));
          
          return (
            <Card key={i} className={`aspect-square !p-3 flex flex-col justify-between hover:border-lumina-400 cursor-pointer transition-colors
              ${dayNum === 15 ? 'bg-accent-rose/30 border-accent-rose' : ''}`}>
              <Typography variant="small" className="font-bold opacity-40">{dayNum}</Typography>
              {hasEvent && (
                <div className="w-1.5 h-1.5 rounded-full bg-lumina-900 mx-auto" />
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Typography variant="h3" className="mb-6 italic">{lang === 'pt' ? 'Foco Próximo' : 'Upcoming Focus'}</Typography>
        <div className="space-y-4">
          <Card className="flex items-center gap-6 border-l-4 border-l-lumina-900">
            <Typography variant="h3" className="w-16">18 May</Typography>
            <div>
              <Typography variant="body" className="font-semibold">{lang === 'pt' ? 'Retiro de Fim de Semana' : 'Spring Weekend Retreat'}</Typography>
              <Typography variant="small">{lang === 'pt' ? 'Foco em Manifestação e Autocuidado' : 'Manifestation and Self-care focus'}</Typography>
            </div>
            <Button variant="ghost" className="ml-auto">{t.common.details}</Button>
          </Card>
          <Card className="flex items-center gap-6 border-l-4 border-l-accent-lavender">
            <Typography variant="h3" className="w-16">22 May</Typography>
            <div>
              <Typography variant="body" className="font-semibold">{lang === 'pt' ? 'Workshop de Fotografia' : 'Photography Workshop'}</Typography>
              <Typography variant="small">{lang === 'pt' ? 'Aprendendo fotos estéticas manuais' : 'Learning manual aesthetic shots'}</Typography>
            </div>
            <Button variant="ghost" className="ml-auto">{t.common.details}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
