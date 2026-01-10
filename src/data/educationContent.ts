import { EducationCategory, EducationArticle } from '@/types';

export const EDUCATION_CATEGORIES: EducationCategory[] = [
  {
    id: 'aftercare-guide',
    title: 'Tattoo Aftercare Guide',
    icon: '📖',
    articles: [
      {
        id: 'complete-aftercare-guide',
        categoryId: 'aftercare-guide',
        title: 'Complete Aftercare Guide',
        summary: 'Your comprehensive guide to healing your new tattoo',
        content: [
          'Everything you need to know about caring for your new tattoo, from day one through full healing.'
        ],
        externalUrl: 'https://bluedreambudder.com/tattoo-aftercare-guide'
      }
    ]
  },
  {
    id: 'whats-normal',
    title: "What's Normal",
    icon: '✓',
    articles: [
      {
        id: 'normal-redness',
        categoryId: 'whats-normal',
        title: 'Redness & Warmth',
        summary: 'Understanding typical inflammation during healing',
        content: [
          "Some redness and warmth around your new tattoo is completely normal, especially in the first few days.",
          "Your body is responding to the tattooing process, which involves tiny punctures in the skin.",
          "The redness should gradually decrease over the first week.",
          "If redness spreads significantly beyond the tattoo or increases after day 3-4, see the 'When to Seek Help' section."
        ],
        escalationNote: "If you're concerned about the level of redness, contact your tattoo artist first. They see healing tattoos regularly and can advise whether what you're experiencing is typical."
      },
      {
        id: 'normal-peeling',
        categoryId: 'whats-normal',
        title: 'Peeling & Flaking',
        summary: 'Why your tattoo peels and what to expect',
        content: [
          "Peeling typically starts around day 3-5 and can last through day 14.",
          "This is your skin's natural healing process—think of it like a sunburn peel.",
          "The peeling skin may contain some ink, making it look colorful. This is normal.",
          "Let the flakes fall off naturally. Picking at them can damage your tattoo and cause scarring.",
          "Some areas may peel more than others, especially areas with more ink saturation."
        ]
      },
      {
        id: 'normal-itching',
        categoryId: 'whats-normal',
        title: 'Itching & Tightness',
        summary: 'Managing the itch without damaging your tattoo',
        content: [
          "Itching is one of the most common (and annoying) parts of tattoo healing.",
          "It usually peaks around days 3-7 when peeling is active.",
          "The tightness you feel is your skin regenerating—a good sign!",
          "To manage itching: tap around the area gently, apply a thin layer of moisturizer, or use a cool (not cold) cloth nearby.",
          "Never scratch directly on the tattoo."
        ]
      },
      {
        id: 'normal-dullness',
        categoryId: 'whats-normal',
        title: 'Cloudy or Dull Appearance',
        summary: 'Why your tattoo looks hazy during healing',
        content: [
          "During the peeling phase, your tattoo may look cloudy, hazy, or dull.",
          "This is sometimes called the 'milky' or 'silver skin' stage.",
          "It happens because new skin is forming over the ink.",
          "The cloudiness typically clears up by day 14-21.",
          "Your tattoo's true vibrancy will show once fully healed (around 4-6 weeks)."
        ]
      }
    ]
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    icon: '⚠',
    articles: [
      {
        id: 'mistake-over-moisturizing',
        categoryId: 'common-mistakes',
        title: 'Over-Moisturizing',
        summary: 'Why more is not better for tattoo care',
        content: [
          "One of the most common mistakes is applying too much aftercare product.",
          "Over-moisturizing can suffocate the skin, trap bacteria, and slow healing.",
          "Signs of over-moisturizing: greasy/shiny appearance, breakouts around the tattoo, slower healing.",
          "The right amount: a thin layer that absorbs within a few minutes.",
          "If it looks glossy or wet, you've used too much. Gently blot with a clean paper towel."
        ]
      },
      {
        id: 'mistake-picking',
        categoryId: 'common-mistakes',
        title: 'Picking & Scratching',
        summary: 'The damage caused by picking at your tattoo',
        content: [
          "Picking at scabs or flaking skin can pull out ink and cause patchy healing.",
          "Scratching can introduce bacteria and increase scarring risk.",
          "Even light scratching can damage the delicate new skin forming.",
          "If you accidentally scratch, wash gently and apply a thin layer of aftercare.",
          "Keep nails trimmed and try tapping around (not on) the tattoo if itchy."
        ]
      },
      {
        id: 'mistake-sun',
        categoryId: 'common-mistakes',
        title: 'Sun Exposure',
        summary: 'Protecting your investment from UV damage',
        content: [
          "UV rays are one of the biggest threats to tattoo longevity.",
          "During healing, direct sun can cause burning, blistering, and significant fading.",
          "Even after healed, UV exposure will fade your tattoo over time.",
          "During healing: cover with loose clothing or stay in shade.",
          "After healed: always use SPF 30+ on exposed tattoos."
        ]
      },
      {
        id: 'mistake-soaking',
        categoryId: 'common-mistakes',
        title: 'Soaking in Water',
        summary: 'Why pools, baths, and oceans are off-limits',
        content: [
          "Submerging a healing tattoo can introduce bacteria and cause infection.",
          "Pool chemicals (chlorine) can irritate and damage healing skin.",
          "Ocean water contains bacteria that can infect an open wound.",
          "Hot tubs are especially risky due to warm water breeding bacteria.",
          "Quick showers are fine—just avoid direct water pressure and pat dry.",
          "Wait at least 2-3 weeks before any water submersion, or until fully healed."
        ]
      }
    ]
  },
  {
    id: 'itch-peeling',
    title: 'Itch & Peeling',
    icon: '🩹',
    articles: [
      {
        id: 'managing-itch',
        categoryId: 'itch-peeling',
        title: 'Managing the Itch',
        summary: 'Safe ways to find relief without damaging your tattoo',
        content: [
          "Gently tap or slap around the itchy area (not directly on it).",
          "Apply a thin layer of unscented moisturizer—this often provides relief.",
          "Place a cool (not ice cold) cloth near but not on the tattoo.",
          "Distraction helps! Keep your hands busy with something else.",
          "Wear loose, soft fabrics that won't irritate the area.",
          "Some people find that taking an antihistamine helps with severe itching—consult a pharmacist first."
        ]
      },
      {
        id: 'peeling-timeline',
        categoryId: 'itch-peeling',
        title: 'Peeling Timeline',
        summary: 'What to expect day by day',
        content: [
          "Days 1-2: Usually no peeling yet. Focus on gentle cleaning.",
          "Days 3-5: Peeling often begins. Skin may feel tight and start flaking.",
          "Days 6-10: Peak peeling phase. Large flakes are normal.",
          "Days 11-14: Peeling slows down. Some areas may still be flaky.",
          "Days 15+: Most peeling complete. Focus shifts to moisturizing and sun protection."
        ]
      }
    ]
  },
  {
    id: 'contact-artist',
    title: 'When to Contact Your Artist',
    icon: '📞',
    articles: [
      {
        id: 'artist-questions',
        categoryId: 'contact-artist',
        title: 'Good Reasons to Reach Out',
        summary: 'When your artist can help',
        content: [
          "You're unsure if your healing looks normal—send them a photo!",
          "You notice ink loss or patchy areas forming.",
          "You have questions about specific aftercare products.",
          "You want to schedule a touch-up appointment.",
          "You're experiencing reactions you're unsure about.",
          "Your artist has seen hundreds of healing tattoos and can often provide reassurance or guidance."
        ]
      },
      {
        id: 'touch-ups',
        categoryId: 'contact-artist',
        title: 'Understanding Touch-Ups',
        summary: 'When and why you might need one',
        content: [
          "Some ink loss during healing is normal, especially in high-movement areas.",
          "Wait until fully healed (4-6 weeks minimum) before assessing if you need a touch-up.",
          "Many artists offer free touch-ups within a certain timeframe—ask about their policy.",
          "Common touch-up areas: fingers, feet, elbows, areas that get a lot of friction.",
          "Color tattoos may need occasional touch-ups over the years to maintain vibrancy."
        ]
      }
    ]
  },
  {
    id: 'seek-medical',
    title: 'When to Seek Medical Care',
    icon: '🏥',
    articles: [
      {
        id: 'warning-signs',
        categoryId: 'seek-medical',
        title: 'Warning Signs',
        summary: 'Symptoms that may require professional medical attention',
        content: [
          "Spreading redness that extends well beyond the tattoo border, especially after the first few days.",
          "Red streaks extending from the tattoo toward other parts of your body.",
          "Increasing pain that gets worse rather than better after day 2-3.",
          "Fever, chills, or feeling unwell.",
          "Pus or discharge that is yellow, green, or has a foul smell.",
          "Significant swelling that increases rather than decreases.",
          "Blistering or open sores that weren't there initially."
        ],
        escalationNote: "If you experience any of these symptoms, please contact a medical professional promptly. This app provides educational information only and cannot diagnose conditions."
      },
      {
        id: 'allergic-reactions',
        categoryId: 'seek-medical',
        title: 'Allergic Reactions',
        summary: 'Understanding tattoo ink allergies',
        content: [
          "Allergic reactions to tattoo ink are uncommon but can happen.",
          "Symptoms may include: persistent itching, raised bumps, rash, or blistering localized to one color.",
          "Red ink historically has the highest reaction rate, though modern inks are safer.",
          "Reactions can appear immediately or weeks/months later.",
          "If you suspect an allergic reaction, document with photos and consult a dermatologist."
        ],
        escalationNote: "Allergic reactions may require medical treatment. Contact a healthcare provider if you suspect you're having a reaction."
      }
    ]
  }
];

export function getArticle(articleId: string): EducationArticle | undefined {
  for (const category of EDUCATION_CATEGORIES) {
    const article = category.articles.find(a => a.id === articleId);
    if (article) return article;
  }
  return undefined;
}

export function searchArticles(query: string): EducationArticle[] {
  const lowerQuery = query.toLowerCase();
  const results: EducationArticle[] = [];
  
  for (const category of EDUCATION_CATEGORIES) {
    for (const article of category.articles) {
      if (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.summary.toLowerCase().includes(lowerQuery) ||
        article.content.some(c => c.toLowerCase().includes(lowerQuery))
      ) {
        results.push(article);
      }
    }
  }
  
  return results;
}
