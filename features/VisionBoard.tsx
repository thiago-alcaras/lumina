
import React, { useState } from 'react';
import { Typography, Button, Input, Card } from '../components/DesignSystem';
import { VisionItem } from '../types';
import { generateVisionBoardImage } from '../services/geminiService';
import { Language } from '../locales';

interface VisionBoardProps {
  items: VisionItem[];
  setItems: React.Dispatch<React.SetStateAction<VisionItem[]>>;
  t: any;
  lang: Language;
}

// Fixed: Added t and lang to props to match what is passed from App.tsx
const VisionBoard: React.FC<VisionBoardProps> = ({ items, setItems, t, lang }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const imageUrl = await generateVisionBoardImage(prompt);
    if (imageUrl) {
      const newItem: VisionItem = {
        id: Math.random().toString(),
        imageUrl,
        prompt,
        category: 'manifestation'
      };
      setItems([newItem, ...items]);
      setPrompt('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <Typography variant="h2" className="mb-2">{t.vision.title}</Typography>
        <Typography variant="body" className="mb-8">{t.vision.subtitle}</Typography>
        
        <div className="flex gap-4">
          <Input 
            placeholder={t.vision.input_placeholder} 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? t.vision.loading : t.vision.button}
          </Button>
        </div>
      </header>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {items.map(item => (
          <div key={item.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-zoom-in">
            <img src={item.imageUrl} alt={item.prompt} className="w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
              <Typography variant="small" className="text-white italic">"{item.prompt}"</Typography>
            </div>
          </div>
        ))}

        {/* Placeholders if empty */}
        {items.length === 0 && !loading && [1,2,3,4,5,6].map(i => (
          <div key={i} className="break-inside-avoid aspect-[4/5] bg-lumina-100 rounded-2xl border-2 border-dashed border-lumina-200" />
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;
