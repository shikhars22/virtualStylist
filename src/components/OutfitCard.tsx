import React from 'react';
import { Outfit } from '../types';
import { motion } from 'motion/react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface OutfitCardProps {
  outfit: Outfit;
  index: number;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#1a1a1a]/5 flex flex-col h-full"
    >
      <div className="aspect-square relative bg-[#f9f9f7] overflow-hidden">
        {outfit.imageUrl ? (
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={outfit.imageUrl}
            alt={outfit.type}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#1a1a1a]/20">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs uppercase tracking-widest font-medium">Visualizing...</span>
          </div>
        )}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm border border-[#1a1a1a]/5">
            {outfit.type}
          </span>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="font-serif text-2xl mb-4 italic">{outfit.type} Look</h3>
        <p className="text-sm text-[#1a1a1a]/70 leading-relaxed mb-6">
          {outfit.description}
        </p>
        
        <div className="mt-auto">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]/40 mb-3">Key Pieces</h4>
          <ul className="space-y-3">
            {outfit.pieces.map((piece, i) => (
              <li key={i} className="flex items-center justify-between text-xs group/item">
                <div className="flex items-center text-[#1a1a1a]/80">
                  <div className="w-1 h-1 rounded-full bg-[#1a1a1a]/20 mr-3" />
                  {piece.name}
                </div>
                <a
                  href={piece.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors flex items-center gap-1"
                >
                  Shop
                  <ArrowRight className="w-2 h-2" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
