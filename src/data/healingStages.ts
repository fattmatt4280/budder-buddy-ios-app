// Visual healing stages data for the interactive guide

export interface HealingStageInfo {
  id: string;
  name: string;
  emoji: string;
  dayRange: string;
  description: string;
  visualSigns: string[];
  whatToExpect: string[];
  isNormal: boolean;
  severity: 'normal' | 'monitor' | 'concern';
  tips: string[];
}

export const HEALING_STAGES: HealingStageInfo[] = [
  {
    id: 'fresh',
    name: 'Fresh & Weeping',
    emoji: '💧',
    dayRange: 'Days 0-2',
    description: 'Your tattoo is an open wound. Some plasma and ink seepage is completely normal.',
    visualSigns: [
      'Clear or slightly yellowish fluid (plasma) on surface',
      'Redness and warmth around the tattoo',
      'Slight swelling, especially on larger pieces',
      'Ink may appear to "leak" slightly - this is excess ink coming out',
    ],
    whatToExpect: [
      'The area will feel tender and sensitive',
      'Plasma may form a thin, shiny layer',
      'Colors will look very vibrant (will settle later)',
    ],
    isNormal: true,
    severity: 'normal',
    tips: [
      'Wash gently 2-3 times daily',
      'Pat dry with clean paper towel',
      'Apply very thin layer of aftercare',
      'Let it breathe - avoid tight clothing',
    ],
  },
  {
    id: 'peeling',
    name: 'Peeling & Flaking',
    emoji: '🍂',
    dayRange: 'Days 3-14',
    description: 'Like a sunburn peel, your skin is shedding the damaged top layer. This is healthy healing!',
    visualSigns: [
      'Dry, flaky skin falling off naturally',
      'Thin, papery flakes (may contain some ink color)',
      'Skin underneath looks lighter or "milky"',
      'Tattoo may appear dull or hazy',
    ],
    whatToExpect: [
      'Itching - sometimes intense!',
      'Flakes may come off in the shower',
      'Different areas peel at different times',
      'The "cloudy" look will clear up',
    ],
    isNormal: true,
    severity: 'normal',
    tips: [
      'DO NOT pick or scratch the flakes',
      'Moisturize lightly to help with itching',
      'Tap around the area if itchy',
      'Let flakes fall off naturally',
    ],
  },
  {
    id: 'scabbing',
    name: 'Light Scabbing',
    emoji: '🩹',
    dayRange: 'Days 3-10',
    description: 'Small, thin scabs are normal. They protect the healing skin underneath.',
    visualSigns: [
      'Thin, raised areas that feel rougher',
      'Darker patches where ink is concentrated',
      'May feel "crusty" in some spots',
      'Scabs follow the tattoo lines',
    ],
    whatToExpect: [
      'Scabs will fall off on their own (7-14 days)',
      'Pulling them off causes ink loss',
      'Heavy scabs = usually over-moisturizing',
    ],
    isNormal: true,
    severity: 'normal',
    tips: [
      'NEVER pick scabs - causes ink loss',
      'Keep scabs dry between washes',
      'Reduce moisturizer if scabs are thick',
      'Wear loose clothing to avoid rubbing',
    ],
  },
  {
    id: 'heavy-scabbing',
    name: 'Heavy Scabbing',
    emoji: '⚠️',
    dayRange: 'Days 4-14',
    description: 'Thick, raised scabs may indicate over-moisturizing or trauma. Worth monitoring.',
    visualSigns: [
      'Thick, raised crusty areas',
      'Scabs that feel very hard or elevated',
      'Dark, almost "chunky" appearance',
      'May crack if skin moves',
    ],
    whatToExpect: [
      'May take longer to heal',
      'Some ink loss possible when scabs fall',
      'May need touch-up after healing',
    ],
    isNormal: false,
    severity: 'monitor',
    tips: [
      'Stop over-moisturizing immediately',
      'Let the area dry out and breathe',
      'Don\'t pick - let them fall naturally',
      'Contact your artist for advice',
    ],
  },
  {
    id: 'cloudy',
    name: 'Cloudy / Silver Skin',
    emoji: '🌫️',
    dayRange: 'Days 10-21',
    description: 'New skin forming over your tattoo creates a hazy, "milky" appearance. This is temporary!',
    visualSigns: [
      'Tattoo looks dull, hazy, or "faded"',
      'Silvery or whitish sheen over the ink',
      'Colors appear muted',
      'Skin feels smoother but looks cloudy',
    ],
    whatToExpect: [
      'This is completely normal',
      'Will clear up in 1-2 weeks',
      'Final vibrancy shows at 4-6 weeks',
    ],
    isNormal: true,
    severity: 'normal',
    tips: [
      'Be patient - it will clear',
      'Continue gentle moisturizing',
      'Start thinking about sun protection',
      'Stay hydrated',
    ],
  },
  {
    id: 'redness',
    name: 'Normal Redness',
    emoji: '🔴',
    dayRange: 'Days 0-5',
    description: 'Your body\'s natural response to the tattooing process. Should decrease, not spread.',
    visualSigns: [
      'Pink or red skin around the tattoo',
      'Warmth to the touch',
      'Redness stays close to tattoo edges',
      'Gradually fades over first week',
    ],
    whatToExpect: [
      'Most intense first 2-3 days',
      'Should decrease daily',
      'Lighter skin shows redness more',
    ],
    isNormal: true,
    severity: 'normal',
    tips: [
      'Keep clean and moisturized',
      'Avoid irritating the area',
      'If it spreads beyond day 3-4, contact a professional',
    ],
  },
  {
    id: 'spreading-redness',
    name: 'Spreading Redness',
    emoji: '🚨',
    dayRange: 'Any time',
    description: 'Redness that spreads beyond the tattoo or increases after day 3-4 needs attention.',
    visualSigns: [
      'Red area extends well past tattoo edges',
      'Red streaks moving away from tattoo',
      'Redness increasing instead of decreasing',
      'Hot to the touch',
    ],
    whatToExpect: [
      'This may indicate infection',
      'Should be evaluated by a professional',
    ],
    isNormal: false,
    severity: 'concern',
    tips: [
      'Contact a healthcare provider',
      'Document with photos',
      'Don\'t panic, but don\'t wait',
      'Keep the area clean',
    ],
  },
  {
    id: 'infected',
    name: 'Possible Infection',
    emoji: '🏥',
    dayRange: 'Any time',
    description: 'These signs need medical attention. Please contact a healthcare provider.',
    visualSigns: [
      'Pus that is yellow, green, or smells bad',
      'Increasing pain after day 2-3',
      'Fever or feeling unwell',
      'Spreading redness or red streaks',
      'Excessive swelling',
    ],
    whatToExpect: [
      'Infections are treatable',
      'Early treatment = better outcomes',
      'May need antibiotics',
    ],
    isNormal: false,
    severity: 'concern',
    tips: [
      'Seek medical care promptly',
      'Keep the area clean',
      'Don\'t try to "treat" it yourself',
      'Infections are not your fault',
    ],
  },
];

export function getStageById(id: string): HealingStageInfo | undefined {
  return HEALING_STAGES.find(stage => stage.id === id);
}

export function getNormalStages(): HealingStageInfo[] {
  return HEALING_STAGES.filter(stage => stage.severity === 'normal');
}

export function getConcerningStages(): HealingStageInfo[] {
  return HEALING_STAGES.filter(stage => stage.severity !== 'normal');
}
