// Day-specific healing tips based on tattoo age

export interface DailyTipData {
  dayRange: [number, number];
  tips: string[];
}

export const DAILY_TIPS_BY_DAY: DailyTipData[] = [
  {
    dayRange: [0, 0],
    tips: [
      "Your tattoo is fresh! Swelling, redness, and warmth are completely normal. Keep it clean and dry.",
      "Fresh ink day! Some plasma or ink seepage is normal. Pat dry gently, never rub.",
      "Day 0: Your body is starting its natural healing response. Expect some tenderness and warmth.",
    ]
  },
  {
    dayRange: [1, 1],
    tips: [
      "Day 1: Swelling and redness are still normal. Your body is starting the healing process.",
      "Expect redness and warmth today. Wash gently with lukewarm water and apply a thin layer of moisturizer.",
      "Swelling peaks around Day 1-2. Ice near (not on!) the tattoo can help if needed.",
    ]
  },
  {
    dayRange: [2, 2],
    tips: [
      "Swelling should start going down today. Redness may linger but should be less intense.",
      "Day 2: Redness should be fading. If swelling persists a bit longer, that's still normal.",
      "Your skin might feel tight today as the initial healing layer forms. Keep moisturizing thin!",
    ]
  },
  {
    dayRange: [3, 3],
    tips: [
      "Your skin may feel tight and sensitive today. This is your body forming a protective layer!",
      "Day 3: Tightness is normal. The top layer is starting to dry and form a light protective barrier.",
      "Feeling some tightness or dryness? That's a sign healing is progressing. Don't over-moisturize!",
    ]
  },
  {
    dayRange: [4, 5],
    tips: [
      "Light flaking may begin. Resist the urge to pick! Let dead skin fall off naturally.",
      "Days 4-5: Early peeling might start. Your tattoo may feel dry—apply a thin moisturizer layer.",
      "Seeing some flakes? That's normal! The old skin layer is shedding. Don't pick or scratch!",
    ]
  },
  {
    dayRange: [6, 7],
    tips: [
      "Peeling is in full swing! Your tattoo may look dull or cloudy—this is completely temporary.",
      "Days 6-7: Active peeling phase. Colors look faded? Don't worry, they'll come back vibrant!",
      "Heavy peeling now. The 'cloudy' look is just new skin forming. Patience is key!",
    ]
  },
  {
    dayRange: [8, 10],
    tips: [
      "Itching can be intense now. Tap around the area or apply a thin layer of moisturizer—never scratch!",
      "Days 8-10: Peak itching phase! Gently tap or slap around the area for relief. Never scratch directly.",
      "Itchy? That means healing! A cool, damp cloth can help. Scratching can damage your ink.",
    ]
  },
  {
    dayRange: [11, 14],
    tips: [
      "Peeling should be slowing down. The 'milky' look is new skin forming over your ink.",
      "Days 11-14: Most peeling is done. Your tattoo might still look slightly cloudy—totally normal!",
      "Almost through the peeling phase. The milky layer will clear up as skin continues to heal.",
    ]
  },
  {
    dayRange: [15, 21],
    tips: [
      "Your tattoo is settling in. Surface may look healed but deeper layers still need time.",
      "Week 3: Looking good! Keep moisturizing daily. Deeper skin layers are still repairing.",
      "Surface healing complete! But remember—full healing takes 4-6 weeks beneath the skin.",
    ]
  },
  {
    dayRange: [22, 30],
    tips: [
      "Almost there! Keep moisturizing and start using SPF when going outside.",
      "Final stretch! Your tattoo is nearly healed. Start protecting it with SPF 30+ in the sun.",
      "Looking great! As you near the finish line, make SPF your new best friend for vibrant colors.",
    ]
  },
  {
    dayRange: [31, 999],
    tips: [
      "Your tattoo is healed on the surface! Protect it with SPF 30+ to keep colors vibrant for life.",
      "Healed and beautiful! Regular moisturizing and sun protection will keep your ink looking fresh.",
      "Congrats, you made it! Consider a touch-up consultation in a few months if needed.",
    ]
  },
];

// Generic tips for when no tattoo is selected
export const GENERIC_TIPS = [
  "Drink plenty of water to keep your skin hydrated from within.",
  "Use fragrance-free products on healing tattoos to avoid irritation.",
  "Keep new tattoos out of direct sunlight for at least 2 weeks.",
  "Avoid tight clothing that rubs against healing tattoos.",
  "Pat dry after washing – never rub your healing tattoo.",
];

/**
 * Get a day-specific healing tip based on the tattoo's age
 * Uses date seed to pick a stable tip for the day
 */
export function getDailyTip(dayNumber: number): string {
  // Find the matching day range
  const dayData = DAILY_TIPS_BY_DAY.find(
    (data) => dayNumber >= data.dayRange[0] && dayNumber <= data.dayRange[1]
  );

  if (!dayData) {
    // Fallback to healed tips
    const healedData = DAILY_TIPS_BY_DAY[DAILY_TIPS_BY_DAY.length - 1];
    return healedData.tips[0];
  }

  // Use date seed for stable daily selection
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  
  return dayData.tips[seed % dayData.tips.length];
}

/**
 * Get a generic tip for users without an active tattoo
 */
export function getGenericTip(): string {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  return GENERIC_TIPS[seed % GENERIC_TIPS.length];
}
