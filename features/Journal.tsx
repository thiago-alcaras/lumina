
import React from 'react';
import { Typography, Card, Button } from '../components/DesignSystem';
import { Language } from '../locales';

interface JournalProps {
  t: any;
  lang: Language;
}

// Fixed: Added JournalProps and accepted t/lang to match what is passed from App.tsx
const Journal: React.FC<JournalProps> = ({ t, lang }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <Typography variant="h1" className="italic">{t.journal.title}</Typography>
        <Typography variant="body">{t.journal.subtitle}</Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 !p-8">
          <Typography variant="h3">{t.journal.morning_title}</Typography>
          <textarea 
            className="flex-1 min-h-[150px] bg-transparent border-none focus:ring-0 resize-none font-serif text-lg leading-relaxed placeholder:opacity-30"
            placeholder={t.journal.morning_placeholder}
          />
          <Button variant="secondary" size="sm" className="self-end">{t.journal.save}</Button>
        </Card>

        <Card className="flex flex-col gap-6 !p-8 bg-lumina-900 text-white">
          <Typography variant="h3" className="text-white">{t.journal.evening_title}</Typography>
          <textarea 
            className="flex-1 min-h-[150px] bg-transparent border-none focus:ring-0 resize-none font-serif text-lg leading-relaxed text-white/90 placeholder:text-white/20"
            placeholder={t.journal.evening_placeholder}
          />
          <Button variant="secondary" size="sm" className="self-end !bg-white !text-lumina-900">{t.journal.save}</Button>
        </Card>
      </div>

      <section className="space-y-6">
        <Typography variant="h2">{t.journal.previous}</Typography>
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="flex justify-between items-center group cursor-pointer hover:bg-lumina-50 transition-colors">
              <div>
                <Typography variant="small" className="uppercase tracking-widest text-[10px]">MAY 10, 2024</Typography>
                <Typography variant="h3">The Sunday Morning Glow</Typography>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">✨</span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Read</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Journal;
