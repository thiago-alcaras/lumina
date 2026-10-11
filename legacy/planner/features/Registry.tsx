
import React, { useState } from 'react';
import { Typography, Button, Card, Input } from '../components/DesignSystem';
import { Outfit } from '../types';
import { ICONS } from '../constants';
import { Language } from '../locales';

interface RegistryProps {
  outfits: Outfit[];
  setOutfits: React.Dispatch<React.SetStateAction<Outfit[]>>;
  t: any;
  lang: Language;
}

// Fixed: Added t and lang to props to match what is passed from App.tsx
const Registry: React.FC<RegistryProps> = ({ outfits, setOutfits, t, lang }) => {
  const [filter, setFilter] = useState('all');

  const addOutfit = () => {
    const newOutfit: Outfit = {
      id: Math.random().toString(),
      name: lang === 'pt' ? 'Novo Estilo' : 'New Style',
      category: 'casual',
      image: 'https://picsum.photos/seed/' + Math.random() + '/400/600',
      dateAdded: new Date().toISOString()
    };
    setOutfits([newOutfit, ...outfits]);
  };

  const filtered = filter === 'all' ? outfits : outfits.filter(o => o.category === filter);

  const categories = ['all', 'casual', 'formal', 'work', 'sport'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <Typography variant="h2">{t.registry.title}</Typography>
          <Typography variant="body">{t.registry.subtitle}</Typography>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${filter === cat ? 'bg-lumina-900 text-white' : 'bg-white border border-lumina-200 text-lumina-500 hover:border-lumina-400'}`}
            >
              {t.registry.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Add Card */}
        <button 
          onClick={addOutfit}
          className="aspect-[3/4] border-2 border-dashed border-lumina-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-lumina-100 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-lumina-100 flex items-center justify-center group-hover:bg-white transition-colors">
            <ICONS.Plus />
          </div>
          <Typography variant="small" className="font-bold">{t.registry.add_look}</Typography>
        </button>

        {filtered.map(outfit => (
          <div key={outfit.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
            <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <Typography variant="h3" className="text-white !mb-1">{outfit.name}</Typography>
              <Typography variant="small" className="text-white/80 uppercase tracking-widest text-[10px]">{t.registry.categories[outfit.category]}</Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Registry;
