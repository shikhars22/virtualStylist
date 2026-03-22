export interface Piece {
  name: string;
  searchUrl: string;
}

export interface Outfit {
  type: 'Casual' | 'Business' | 'Night Out';
  description: string;
  pieces: Piece[];
  imagePrompt: string;
  imageUrl?: string;
}

export interface AnalysisResult {
  itemName: string;
  colorPalette: string[];
  style: string;
  outfits: Outfit[];
}
