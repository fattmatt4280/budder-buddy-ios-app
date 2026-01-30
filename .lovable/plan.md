

# Update Activity Reminders Messaging

## Summary
Update the "Safe to Submerge" countdown messaging to replace "no gym" with "no still water" references, making it clear that users can still work out - they just need to avoid still water (pools, baths, hot tubs) and sun exposure.

---

## Changes Overview

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/environment/SafeToSubmergeCard.tsx` | Update badge labels and success messages |
| `src/lib/environmentService.ts` | Update countdown messages and celebration notification |

---

## Detailed Changes

### 1. SafeToSubmergeCard.tsx

**Compact view (line 39)**
- Before: `'Swimming & gym OK'`
- After: `'Swimming & soaking OK'`

**Full view warning badges (lines 82-90)**
- Keep: `🏊 No swimming`
- Keep: `🛁 No baths`
- Change: `🏋️ No gym` → `🛁 No hot tubs`

### 2. environmentService.ts

**Success message (line 73)**
- Before: `"🎉 You're clear! Your tattoo is healed enough for swimming and gym activities."`
- After: `"🎉 You're clear! Your tattoo is healed enough for swimming and soaking."`

**Countdown message (line 74)**
- Before: `"🏊 ${daysRemaining} day(s) until it's safe to swim or hit the gym."`
- After: `"🏊 ${daysRemaining} day(s) until it's safe to swim or soak."`

**Celebration notification body (line 237)**
- Before: `"Your tattoo has healed enough for swimming and gym activities. Enjoy!"`
- After: `"Your tattoo has healed enough for swimming and soaking. Enjoy!"`

---

## Updated Badge Display

The warning badges during the countdown will now show:

| Before | After |
|--------|-------|
| 🏊 No swimming | 🏊 No swimming |
| 🛁 No baths | 🛁 No baths |
| 🏋️ No gym | 🛁 No hot tubs |

---

## Result

Users will understand:
- Working out is fine
- Avoid still/stagnant water (pools, baths, hot tubs)
- The concern is bacterial exposure from soaking, not exercise

