

# Dynamic Daily Tips + User Observations

## Summary
Two enhancements to the Today screen:
1. **Dynamic Daily Tips**: Replace generic random tips with day-specific healing guidance (swelling normal on Day 1, tightness on Day 3, peeling on Day 7, etc.)
2. **User Observations**: Add quick-tap symptom tags and a notes field so users can log their own observations during check-ins (hard scabbing, really sore, hot still, etc.)

---

## Changes Overview

| File | Changes |
|------|---------|
| `src/data/dailyTips.ts` | New file with day-specific healing tips for Days 0-30+ |
| `src/types/index.ts` | Add `observations` array field to `DailyCheckin` type |
| `src/pages/TodayScreen.tsx` | Replace random tips with day-aware tips, add Observations section with quick-tap tags |

---

## Part 1: Dynamic Daily Tips

### Day-by-Day Content

| Day | What to Expect | Example Tip |
|-----|---------------|-------------|
| **0** | Fresh ink | "Your tattoo is fresh! Some swelling, redness, and warmth are completely normal." |
| **1** | Swelling/redness peak | "Day 1: Swelling and redness are normal. Your body is beginning the healing process." |
| **2** | Swelling reducing | "Swelling should start going down. Redness may linger but should be less intense." |
| **3** | Tightness begins | "Your skin may feel tight and sensitive. This is your body forming a protective layer." |
| **4-5** | Early flaking | "Light flaking may begin. Resist the urge to pick! Let dead skin fall naturally." |
| **6-7** | Active peeling | "Peeling is in full swing. Your tattoo may look dull or cloudy—this is temporary." |
| **8-10** | Intense itching | "Itching can be intense now. Tap around the area—never scratch." |
| **11-14** | Peeling slowing | "Peeling should be slowing. The 'milky' look is new skin forming over your ink." |
| **15-21** | Settling | "Your tattoo is settling in. Surface may look healed but deeper layers need time." |
| **22-30** | Final phase | "Almost there! Keep moisturizing and start using SPF when going outside." |
| **31+** | Healed | "Your tattoo is healed! Protect it with SPF 30+ to keep colors vibrant." |

### Implementation

Create `src/data/dailyTips.ts`:

```typescript
export interface DailyTipData {
  dayRange: [number, number];
  tips: string[];
}

export const DAILY_TIPS_BY_DAY: DailyTipData[] = [
  { dayRange: [0, 0], tips: [...] },
  { dayRange: [1, 1], tips: [...] },
  // ... all day ranges
];

export function getDailyTip(dayNumber: number): string {
  // Find matching day range, return random tip from that range
}
```

Update `TodayScreen.tsx` to use `getDailyTip(dayNumber)` instead of random generic tips.

---

## Part 2: User Observations

### New Type Definition

Update `src/types/index.ts`:

```typescript
export interface DailyCheckin {
  id: string;
  tattooId: string;
  dayNumber: number;
  date: string;
  checklist: DailyChecklist;
  userNotes?: string;
  observations?: string[]; // NEW: Array of symptom tags
}
```

### Quick-Tap Observation Tags

Add preset symptom options users can quickly tap:

| Category | Tags |
|----------|------|
| **Pain/Discomfort** | "Sore", "Really sore", "Burning sensation", "Throbbing" |
| **Temperature** | "Hot to touch", "Warm", "Normal temperature" |
| **Visual** | "Swelling", "Redness", "Hard scabbing", "Light peeling", "Heavy peeling", "Cloudy/milky look" |
| **Texture** | "Tight skin", "Itchy", "Raised bumps", "Dry/flaky" |
| **Positive** | "Looks great!", "Less swelling", "Healing nicely" |

### UI Design

Add a new "My Observations" card below the checklist:

```text
+------------------------------------------+
|  📝 My Observations                      |
+------------------------------------------+
|  How does your tattoo feel today?        |
|                                          |
|  [Sore] [Hot to touch] [Swelling]        |
|  [Tight skin] [Itchy] [Hard scabbing]    |
|  [Light peeling] [Looks great!]          |
|                                          |
|  Selected: Sore, Tight skin              |
|                                          |
|  [+ Add Note]  (opens text dialog)       |
+------------------------------------------+
```

### Behavior

- Tags are toggle-able (tap to select/deselect)
- Selected tags are saved to `observations` array in the check-in
- Existing `userNotes` field remains for free-form text
- Tags appear as chips with visual feedback when selected
- Observations persist with the daily check-in

---

## User Flow

```text
User opens Today screen
        |
        v
Sees day-specific tip: "Day 3: Skin may feel tight..."
        |
        v
Scrolls to Daily Checklist
        |
        v
Completes checkbox items
        |
        v
New "My Observations" section below checklist
        |
        v
Taps tags: "Sore" + "Tight skin" + "Hot to touch"
        |
        v
Optionally taps "+ Add Note" for free-form text
        |
        v
All saved to check-in record automatically
```

---

## Technical Details

### Observation Tags Constant

```typescript
const OBSERVATION_TAGS = [
  { key: 'sore', label: 'Sore', emoji: '😣' },
  { key: 'really_sore', label: 'Really sore', emoji: '😖' },
  { key: 'hot', label: 'Hot to touch', emoji: '🔥' },
  { key: 'swelling', label: 'Swelling', emoji: '🫧' },
  { key: 'redness', label: 'Redness', emoji: '🔴' },
  { key: 'tight', label: 'Tight skin', emoji: '🤏' },
  { key: 'itchy', label: 'Itchy', emoji: '🐜' },
  { key: 'hard_scab', label: 'Hard scabbing', emoji: '🪨' },
  { key: 'light_peel', label: 'Light peeling', emoji: '🍂' },
  { key: 'heavy_peel', label: 'Heavy peeling', emoji: '🍁' },
  { key: 'cloudy', label: 'Cloudy/milky', emoji: '☁️' },
  { key: 'looks_great', label: 'Looks great!', emoji: '✨' },
  { key: 'healing_well', label: 'Healing nicely', emoji: '💚' },
];
```

### Handler Function

```typescript
const handleObservationToggle = (tag: string) => {
  const currentObs = existingCheckin?.observations || [];
  const newObs = currentObs.includes(tag)
    ? currentObs.filter(t => t !== tag)
    : [...currentObs, tag];
  
  if (existingCheckin) {
    updateCheckin(existingCheckin.id, { observations: newObs });
  } else {
    addCheckin({
      id: generateId(),
      tattooId: tattoo.id,
      dayNumber,
      date: todayDate,
      checklist,
      observations: newObs,
    });
  }
};
```

---

## Fallback for No Tattoo

When no tattoo is selected, show generic tips:
- "Drink plenty of water to keep your skin hydrated."
- "Use fragrance-free products on healing tattoos."
- "Keep new tattoos out of direct sunlight for 2 weeks."

