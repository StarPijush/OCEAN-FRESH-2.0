export interface ProductVM {
  id: string;
  name: string;
  sub: string;
  emoji: string;
  price: number;
  category: string;
  tag: string;
  available: boolean;
  image: string | null;
}

export const PRODUCT_EMOJI_MAP: Record<string, string> = {
  Rohu: '\u{1F41F}',
  Katla: '\u{1F420}',
  'Tiger Prawns': '\u{1F990}',
  Prawns: '\u{1F990}',
  Pomfret: '\u{1F421}',
  Surmai: '\u{1F41F}',
  'King Fish': '\u{1F41F}',
  Bombil: '\u{1F41F}',
  'Bombay Duck': '\u{1F41F}',
  Crab: '\u{1F980}',
  'Mud Crab': '\u{1F980}',
  'Live Blue Crab': '\u{1F980}',
  'Mangrove Crab': '\u{1F980}',
  Bangda: '\u{1F41F}',
  'Indian Mackerel': '\u{1F41F}',
  Rawas: '\u{1F41F}',
  'Indian Salmon': '\u{1F41F}',
  Hilsa: '\u{1F420}',
  'River Shad': '\u{1F420}',
};

export function getEmoji(name: string): string {
  return PRODUCT_EMOJI_MAP[name] ?? '\u{1F41F}';
}

export const servicePincodes = [
  '721501','721502','721503','721504','721505','721506','721507','721508','721509',
  '721513','721514','721515','721516','721517','721518','721520','721521','721527'
];

export const WHATSAPP_NUMBER = '919876543210';
