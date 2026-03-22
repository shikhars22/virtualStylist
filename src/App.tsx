import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Shirt } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { OutfitCard } from './components/OutfitCard';
import { analyzeItem, generateOutfitImage } from './services/gemini';
import { AnalysisResult } from './types';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (base64: string, mimeType: string) => {
    setPreview(`data:${mimeType};base64,${base64}`);
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeItem(base64, mimeType);
      setResult(analysis);

      // Generate images sequentially to not overwhelm or for better UX
      const outfitsWithImages = [...analysis.outfits];
      for (let i = 0; i < outfitsWithImages.length; i++) {
        try {
          const imageUrl = await generateOutfitImage(outfitsWithImages[i].imagePrompt);
          outfitsWithImages[i] = { ...outfitsWithImages[i], imageUrl };
          setResult({ ...analysis, outfits: [...outfitsWithImages] });
        } catch (imgErr) {
          console.error("Failed to generate image for outfit", i, imgErr);
        }
      }
    } catch (err: any) {
      console.error("Stylist Error:", err);
      setError(err.message || "Something went wrong while styling your piece. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-8 py-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Shirt className="text-white w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-[0.4em] font-bold">VogueAI</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-serif text-center leading-tight mb-6"
        >
          Your Personal <br />
          <span className="italic">Virtual Stylist</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#1a1a1a]/50 text-center max-w-md"
        >
          Upload a piece from your wardrobe and let AI curate the perfect ensemble for any occasion.
        </motion.p>
      </header>

      <main className="max-w-7xl mx-auto px-8">
        {!result && !isAnalyzing ? (
          <ImageUpload onUpload={handleUpload} onReset={reset} preview={preview} />
        ) : (
          <div className="space-y-16">
            {/* Analysis Header */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-y border-[#1a1a1a]/10 py-12"
                >
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]/40 mb-2">Item Identified</span>
                    <h2 className="text-3xl font-serif italic">{result.itemName}</h2>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]/40 mb-3">Color Palette</span>
                    <div className="flex gap-2">
                      {result.colorPalette.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border border-black/5 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end">
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#1a1a1a]/10 hover:bg-[#1a1a1a] hover:text-white transition-all text-xs uppercase tracking-widest font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Style New Item
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {isAnalyzing && !result && (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Sparkles className="w-12 h-12 text-[#1a1a1a]/20" />
                </motion.div>
                <h3 className="text-2xl font-serif italic mb-2">Curating your looks...</h3>
                <p className="text-[#1a1a1a]/40 text-sm">Our AI stylist is analyzing your piece and matching it with the perfect items.</p>
              </div>
            )}

            {/* Outfits Grid */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {result.outfits.map((outfit, index) => (
                  <OutfitCard key={outfit.type} outfit={outfit} index={index} />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100">
                {error}
                <button onClick={reset} className="block mx-auto mt-4 underline font-bold text-sm">Try Again</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="mt-32 border-t border-[#1a1a1a]/5 py-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#1a1a1a]/20">
          Powered by Gemini AI & Fashion Intelligence
        </p>
      </footer>
    </div>
  );
}
