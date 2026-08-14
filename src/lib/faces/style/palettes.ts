import type { Palette } from '../types';

// Palettes are separate objects referenced by id, never inlined into a style.
// Otherwise "pure ink" in black-on-cream, in sepia-on-kraft and in Prussian
// blue would each need their own copy of sixty stroke parameters.
//
// FaceParams stores only INDICES into these arrays, so recolouring a face is a
// repaint, not a regeneration.

export const palettes: Record<string, Palette> = {
  'noir-creme': {
    id: 'noir-creme',
    label: 'Noir sur crème',
    // Borrowed from the site's own tokens: --mg-cream / --mg-charcoal.
    paper: '#f2f0eb',
    inks: ['#1d1d1b', '#2b2a26'],
    skins: ['#f2f0eb'],
    hairs: ['#1d1d1b'],
    accents: ['#1d1d1b'],
  },

  risograph: {
    id: 'risograph',
    label: 'Risographie',
    paper: '#f1efe8',
    inks: ['#22211e'],
    skins: ['#f3ddc6', '#eccdb0', '#f7e8d8', '#e8cdbe', '#f1e0cd'],
    hairs: ['#a9c3b0', '#c9a98d', '#adc0cc', '#a6a49d', '#d8c197', '#96a3a8'],
    accents: ['#e0a596', '#adc0cc', '#a9c3b0'],
  },

  sepia: {
    id: 'sepia',
    label: 'Sépia',
    paper: '#efe6d3',
    inks: ['#3d2b1c', '#4a3826'],
    skins: ['#e3cdae', '#d6bb99'],
    hairs: ['#3d2b1c', '#5a4028'],
    accents: ['#8a5a3c'],
  },

  nuit: {
    id: 'nuit',
    label: 'Bleu de nuit',
    paper: '#e4e6e6',
    inks: ['#1b2733'],
    skins: ['#dfe3e2', '#cdd6d6'],
    hairs: ['#1b2733', '#33454f'],
    accents: ['#4a6b7c'],
  },
};

export const paletteOf = (id: string): Palette => palettes[id] ?? palettes['noir-creme'];
