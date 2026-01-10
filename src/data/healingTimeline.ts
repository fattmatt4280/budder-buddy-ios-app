import { DayContent, SizeTier, InkType } from '@/types';

// Healing timeline content based on day ranges
export const HEALING_TIMELINE: DayContent[] = [
  {
    dayRange: [0, 1],
    whatsNormal: [
      "Mild redness, warmth, and soreness are common.",
      "Some seepage of plasma or ink can happen.",
      "The area may feel warm to the touch.",
      "Slight swelling is normal, especially for larger pieces."
    ],
    whatToDo: [
      "Wash gently with lukewarm water and mild, fragrance-free soap.",
      "Pat dry with a clean paper towel—never rub.",
      "Apply a very thin layer of aftercare (not greasy).",
      "Keep the area clean and let it breathe.",
      "Stay hydrated and get plenty of rest."
    ],
    whatToAvoid: [
      "Do not soak (no pools, ocean, hot tubs, or baths).",
      "Avoid tight clothing rubbing the tattoo.",
      "Do not over-moisturize—a thin layer is all you need.",
      "Keep it out of direct sunlight.",
      "Don't touch with unwashed hands."
    ],
    notificationTemplates: {
      morning: "Day {{day}}: Gentle wash + thin layer 🧼🧴",
      evening: "Quick check-in: keep it clean and dry tonight."
    }
  },
  {
    dayRange: [2, 5],
    whatsNormal: [
      "Tightness and itchiness can start.",
      "Light peeling or flaking is common.",
      "The tattoo may look slightly dull.",
      "Some areas may feel warmer than others."
    ],
    whatToDo: [
      "Wash 1–2x/day gently with lukewarm water.",
      "Use a pea-sized amount of aftercare—thin layer only.",
      "Let the tattoo breathe when possible.",
      "Wear loose, breathable clothing over it.",
      "Continue staying well hydrated."
    ],
    whatToAvoid: [
      "Do not scratch or pick at any flaking skin.",
      "Avoid heavy sweating and intense workouts if possible.",
      "No sun exposure—keep it covered or stay in shade.",
      "Don't wrap it tightly unless necessary.",
      "Avoid sleeping directly on the tattoo."
    ],
    notificationTemplates: {
      morning: "Peeling can start around now—don't pick. Thin layer only.",
      evening: "If it's itchy, tap around it—don't scratch."
    }
  },
  {
    dayRange: [6, 14],
    whatsNormal: [
      "Peeling and flaking continues then slows.",
      "Tattoo may look cloudy or dull temporarily.",
      "Itching may come and go.",
      "Some areas heal faster than others—this is normal."
    ],
    whatToDo: [
      "Keep washing gently once daily.",
      "Moisturize lightly as needed (avoid glossy/greasy look).",
      "Wear loose, clean clothing.",
      "Be patient—the cloudiness will clear.",
      "Continue drinking plenty of water."
    ],
    whatToAvoid: [
      "No soaking or swimming.",
      "Avoid direct sun and tanning.",
      "Do not exfoliate or shave over the area.",
      "Don't pick at any remaining flakes.",
      "Avoid heavy lotions or petroleum-based products."
    ],
    notificationTemplates: {
      morning: "Mid-heal: light moisturizer only when needed.",
      evening: "Still healing—avoid sun + soaking."
    }
  },
  {
    dayRange: [15, 30],
    whatsNormal: [
      "Surface may look healed while deeper layers finish settling.",
      "Some dryness can come and go.",
      "Colors may look slightly faded but will settle.",
      "The skin texture is returning to normal."
    ],
    whatToDo: [
      "Moisturize as needed with unscented lotion.",
      "Start using SPF 30+ once surface is fully healed.",
      "Keep skin hydrated from the inside—drink water!",
      "Continue gentle care routine.",
      "Take progress photos to track your healing."
    ],
    whatToAvoid: [
      "Avoid harsh scrubs or exfoliants on the area.",
      "Avoid prolonged sun without protection.",
      "Don't assume it's fully healed—deeper layers are still settling.",
      "Avoid chlorinated water until fully healed."
    ],
    notificationTemplates: {
      morning: "Final phase: hydrate skin + protect it from sun.",
      evening: "Almost there—keep it moisturized, not greasy."
    }
  }
];

// Get content for a specific day
export function getDayContent(dayNumber: number): DayContent {
  for (const content of HEALING_TIMELINE) {
    if (dayNumber >= content.dayRange[0] && dayNumber <= content.dayRange[1]) {
      return content;
    }
  }
  // Post-30 days
  return {
    dayRange: [31, 999],
    whatsNormal: [
      "Your tattoo is considered healed on the surface.",
      "Deep layers continue to settle for several months.",
      "The final appearance will develop over time."
    ],
    whatToDo: [
      "Keep the tattoo moisturized daily.",
      "Always use SPF 30+ when exposed to sun.",
      "Stay hydrated for overall skin health.",
      "Consider a touch-up if needed after 4-6 weeks."
    ],
    whatToAvoid: [
      "Avoid prolonged sun exposure without protection.",
      "Don't pick at any remaining dry patches."
    ],
    notificationTemplates: {
      morning: "Your tattoo is healed! Keep protecting it with SPF.",
      evening: "Maintenance mode: moisturize + protect."
    }
  };
}

// Adjust content based on size and ink type
export function getAdjustedContent(
  content: DayContent,
  sizeTier: SizeTier,
  inkType: InkType
): DayContent {
  const adjusted = { ...content };

  // Size adjustments
  if (sizeTier === 'Large') {
    adjusted.whatsNormal = [
      ...adjusted.whatsNormal,
      "Larger pieces may take longer to heal evenly.",
      "More swelling is normal for bigger tattoos."
    ];
    adjusted.whatToDo = [
      ...adjusted.whatToDo,
      "Take extra care to rest the tattooed area.",
      "Consider sleeping in a position that avoids pressure on the tattoo."
    ];
  }

  // Color adjustments
  if (inkType === 'Color') {
    adjusted.whatToDo = [
      ...adjusted.whatToDo,
      "Color tattoos need extra sun protection to stay vibrant."
    ];
    adjusted.whatToAvoid = [
      ...adjusted.whatToAvoid,
      "UV exposure can fade colors faster—be extra vigilant."
    ];
  }

  return adjusted;
}

// Get notification message for a specific day
export function getNotificationMessage(
  dayNumber: number,
  timeOfDay: 'morning' | 'evening'
): string {
  const content = getDayContent(dayNumber);
  const template = content.notificationTemplates[timeOfDay];
  return template.replace('{{day}}', String(dayNumber));
}
