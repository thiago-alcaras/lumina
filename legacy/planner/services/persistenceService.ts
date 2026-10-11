
import { Outfit, VisionItem, Event } from '../types';

/**
 * Este serviço simula um banco de dados. 
 * Todas as funções são assíncronas para facilitar a migração para Supabase/Firebase.
 */
export const db = {
  outfits: {
    getAll: async (): Promise<Outfit[]> => {
      const data = localStorage.getItem('lumina_outfits');
      return data ? JSON.parse(data) : [];
    },
    save: async (outfits: Outfit[]): Promise<void> => {
      localStorage.setItem('lumina_outfits', JSON.stringify(outfits));
    }
  },
  vision: {
    getAll: async (): Promise<VisionItem[]> => {
      const data = localStorage.getItem('lumina_vision');
      return data ? JSON.parse(data) : [];
    },
    save: async (items: VisionItem[]): Promise<void> => {
      localStorage.setItem('lumina_vision', JSON.stringify(items));
    }
  },
  events: {
    getAll: async (): Promise<Event[]> => {
      const data = localStorage.getItem('lumina_events');
      return data ? JSON.parse(data) : [];
    },
    save: async (events: Event[]): Promise<void> => {
      localStorage.setItem('lumina_events', JSON.stringify(events));
    }
  }
};
