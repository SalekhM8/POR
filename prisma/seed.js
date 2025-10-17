const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  // Safety guard: prevent accidental seeding of remote/prod DBs unless explicitly allowed
  const dbUrl = process.env.DATABASE_URL || "";
  const isRemote = dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");
  const allowRemoteSeed = process.env.ALLOW_SEED_REMOTE === "1";
  if (isRemote && !allowRemoteSeed) {
    console.error("Refusing to seed non-local database. Set ALLOW_SEED_REMOTE=1 if you are sure.");
    process.exit(1);
  }
  console.log('Seeding database...');
  const now = new Date();
  // Clear existing (order matters due to FKs)
  await prisma.booking.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.package.deleteMany();
  await prisma.about.deleteMany();
  await prisma.timeBlock.deleteMany();
  await prisma.recurringBlock.deleteMany();
  await prisma.availabilityRule.deleteMany();

  // About
  const about = await prisma.about.create({
    data: {
      heading: 'A journey through wellness, recovery, and performance',
      content: [
        'I started this practice to help people move better, feel stronger, and recover faster.',
        'From athletes to office workers, I blend time-tested therapies with modern recovery tools.'
      ].join('\n\n'),
      heroUrl: null,
    }
  });

  // Packages
  const packagesData = [
    { title: 'Deep Tissue Massage', slug: 'deep-tissue-massage', description: 'Release tension, improve mobility, and accelerate recovery with a focused deep tissue session.', features: ['Targeted muscle work', 'Mobility focus', 'Breathwork integration'], priceCents: 6500, durationMin: 60, imageUrl: null },
    { title: 'Sports Recovery Massage', slug: 'sports-recovery-massage', description: 'Performance-focused treatment tailored to training schedules and comp phases.', features: ['Pre/post event focus', 'Lymphatic drainage', 'Percussion tools'], priceCents: 7500, durationMin: 75, imageUrl: null },
    { title: 'Wet Cupping (Hijama)', slug: 'wet-cupping', description: 'Traditional detox and relief using controlled wet cupping methods.', features: ['Detox relief', 'Circulation boost', 'Targeted sites'], priceCents: 7000, durationMin: 60, imageUrl: null },
    { title: 'Dry Cupping Therapy', slug: 'dry-cupping', description: 'Improve circulation and mobility with dry cupping and glide techniques.', features: ['Glide technique', 'Scar tissue work', 'Mobility pairing'], priceCents: 6000, durationMin: 45, imageUrl: null },
    { title: 'Contrast Therapy (Sauna + Cold Plunge)', slug: 'contrast-therapy', description: 'Regulate stress, recover faster, and feel energized with guided heat/cold exposure.', features: ['Infrared sauna', 'Cold plunge', 'Guided protocols'], priceCents: 5000, durationMin: 45, imageUrl: null },
    { title: 'Full Reset (Massage + Contrast)', slug: 'full-reset', description: 'Complete reset combining tissue work with guided contrast therapy.', features: ['Full massage', 'Cold + heat', 'Recovery plan'], priceCents: 11000, durationMin: 105, imageUrl: null }
  ];

  const packages = [];
  for (const p of packagesData) {
    const created = await prisma.package.create({ data: p });
    packages.push(created);
  }

  // Case studies (general + athlete-centric)
  const caseStudiesGeneral = Array.from({ length: 8 }).map((_, i) => ({
    title: `Mobility and performance improvement (${i + 1})`,
    slug: `case-${i + 1}`,
    summary: 'Resolving chronic tightness and improving mobility over 6 sessions.',
    content: 'Client presented with chronic tightness in hip flexors and calves. We combined deep tissue release, cupping, and mobility drills. Over 6 sessions, pain reduced significantly and range of motion increased. They returned to consistent training and improved sprint times.',
    coverUrl: null,
    tags: ['recovery', 'mobility', 'performance']
  }));

  const athleteCases = [
    { title: 'Sprinter hamstring rehab: return to peak speed', slug: 'sprinter-hamstring-rehab', summary: 'Acute hamstring tightness managed to full sprint capacity in 4 weeks.', content: 'Sprinter suffered hamstring strain pre-season. We used progressive deep tissue, eccentric loading, and cupping for circulation. By week 4, they hit near PB with no pain.', coverUrl: null, tags: ['athlete', 'sprint', 'hamstring'] },
    { title: 'Marathon runner calf recovery: negative split PR', slug: 'marathon-calf-recovery', summary: 'Chronic calf tightness resolved, enabling a negative split personal record.', content: 'Runner with recurring calf cramps. We alternated dry cupping and targeted release, paired with cadence and mobility drills. Finished next marathon with negative split PR.', coverUrl: null, tags: ['athlete', 'endurance', 'marathon'] },
    { title: 'Football ACL post-op: strength and mobility rebuild', slug: 'football-acl-postop', summary: 'Post-ACL surgery tissue work and swelling management for controlled return.', content: 'Focused lymphatic drainage, quad/hamstring balance, and contrast therapy dosing. Gradual return to plyometrics with improved ROM and confidence.', coverUrl: null, tags: ['athlete', 'football', 'acl'] },
    { title: 'Powerlifter shoulder pain: bench press comeback', slug: 'powerlifter-shoulder', summary: 'Anterior shoulder pain reduced, bench volume restored without flare-ups.', content: 'Addressed pec minor and lat tightness; added scapular control and tissue work. Load ramped within 3 weeks to pre-injury training max.', coverUrl: null, tags: ['athlete', 'powerlifting', 'shoulder'] },
    { title: 'CrossFit low back: bracing and tissue reset', slug: 'crossfit-low-back', summary: 'Low back tightness improved with bracing cues and tissue release.', content: 'Cupping glide on paraspinals and hips, plus brace sequencing. Athlete returned to heavy WODs with better consistency and no flare-ups.', coverUrl: null, tags: ['athlete', 'crossfit', 'back'] },
    { title: 'Cyclist knee tracking: pain-free climb intervals', slug: 'cyclist-knee-tracking', summary: 'Patellar tracking improved, allowing pain-free threshold climbs.', content: 'TFL/quad release and hip control drills. Bike fit tweak plus tissue work enabled long climbs without knee pain.', coverUrl: null, tags: ['athlete', 'cycling', 'knee'] },
    { title: 'Swimmer rotator cuff: freestyle volume increase', slug: 'swimmer-rotator-cuff', summary: 'Shoulder endurance restored; volume increased without impingement.', content: 'Posterior cuff and lat work, plus overhead mobility. Athlete increased weekly volume by 25% pain-free.', coverUrl: null, tags: ['athlete', 'swimming', 'shoulder'] },
    { title: 'Boxer wrist stability: heavy bag return', slug: 'boxer-wrist-stability', summary: 'Wrist pain reduced with tissue work and stability drills.', content: 'Forearm release and cupping with stability/proprioception work. Returned to heavy bag without pain in 2 weeks.', coverUrl: null, tags: ['athlete', 'boxing', 'wrist'] },
    { title: 'Basketball ankle mobility: explosive first step', slug: 'basketball-ankle-mobility', summary: 'Ankle dorsiflexion improved, first-step acceleration increased.', content: 'Soft tissue and banded mobilizations; cupping for circulation. Athlete reported improved agility and reduced stiffness.', coverUrl: null, tags: ['athlete', 'basketball', 'ankle'] },
    { title: 'Rugby neck & trap relief: collision recovery', slug: 'rugby-neck-trap', summary: 'Neck/trap tightness managed for in-season recovery between matches.', content: 'Focused tissue work on traps/SCM and contrast therapy. Player reported reduced headaches and better sleep.', coverUrl: null, tags: ['athlete', 'rugby', 'neck'] }
  ];

  const caseStudiesData = [...caseStudiesGeneral, ...athleteCases];

  const caseStudies = [];
  for (const c of caseStudiesData) {
    const created = await prisma.caseStudy.create({ data: c });
    caseStudies.push(created);
  }

  // Scheduling: 24/7 availability with permanent midnight–5am recurring block, no other blocks
  const allWeek = [0,1,2,3,4,5,6];
  for (const wd of allWeek) {
    await prisma.availabilityRule.create({ data: { weekday: wd, startMinutes: 0, endMinutes: 24*60, isActive: true } });
  }
  for (const wd of allWeek) {
    await prisma.recurringBlock.create({ data: { weekday: wd, startMinutes: 0, endMinutes: 5*60, reason: 'Night closed' } });
  }

  // Enquiries (clear and add 5 well-answered)
  await prisma.enquiry.deleteMany();
  const baseAnswers = (o) => ({ goals: o.goals, painAreas: o.painAreas, activityLevel: o.activityLevel, injuries: o.injuries, preferredTimes: o.preferredTimes, location: o.location, heardFrom: o.heardFrom });
  const enquiryData = [
    { name: 'Amina Khan', email: 'amina@example.com', phone: '07123456789', message: 'Post-race calf tightness; want faster recovery.', treatment: 'sports_massage', source: 'start', answers: baseAnswers({ goals: 'Reduce soreness, improve run economy', painAreas: 'Calves, ankles', activityLevel: '6-7 hrs/week', injuries: 'Small ankle sprain 2023', preferredTimes: 'Weeknights after 6pm', location: 'Studio', heardFrom: 'Friend referral' }) },
    { name: 'Bilal Hussain', email: 'bilal@example.com', phone: '07987654321', message: 'Chronic upper back tension from desk work.', treatment: 'deep_tissue', source: 'start', answers: baseAnswers({ goals: 'Posture, mobility', painAreas: 'Upper back, traps', activityLevel: '3 hrs/week gym', injuries: 'None', preferredTimes: 'Saturday morning', location: 'Studio', heardFrom: 'Instagram' }) },
    { name: 'Noah Smith', email: 'noah@example.com', phone: null, message: 'Interested in contrast therapy for stress.', treatment: 'contrast', source: 'contact', answers: baseAnswers({ goals: 'Stress regulation, sleep', painAreas: 'N/A', activityLevel: '2 hrs/week', injuries: 'None', preferredTimes: 'Flexible evenings', location: 'Studio', heardFrom: 'Google' }) },
    { name: 'Sophia Lee', email: 'sophia@example.com', phone: '07811112222', message: 'Shoulder impingement from swimming.', treatment: 'dry_cupping', source: 'start', answers: baseAnswers({ goals: 'Pain-free swim volume', painAreas: 'Anterior shoulder', activityLevel: '5 hrs/week swim', injuries: 'Shoulder impingement 2024', preferredTimes: 'Tue/Thu evenings', location: 'Studio', heardFrom: 'Coach' }) },
    { name: 'Omar Rahman', email: 'omar@example.com', phone: '07777777777', message: 'Tight hips and hamstrings impacting football.', treatment: 'wet_cupping', source: 'start', answers: baseAnswers({ goals: 'Mobility and sprint speed', painAreas: 'Hips, hamstrings', activityLevel: '4-5 hrs/week football', injuries: 'Minor hamstring strain 2022', preferredTimes: 'Weekend afternoon', location: 'Studio', heardFrom: 'TikTok' }) },
  ];
  for (const e of enquiryData) {
    await prisma.enquiry.create({ data: e });
  }

  // Bookings
  const statuses = ['pending', 'confirmed', 'cancelled'];
  for (let i = 0; i < 12; i++) {
    const pkg = pick(packages);
    // Seed with some time-based bookings next week to demonstrate slot blocking
    const baseDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7 + (i % 5), 0, 0, 0, 0));
    const startMinutes = 9*60 + (i % 6) * 45; // staggered within the day
    const start = new Date(baseDay);
    start.setUTCMinutes(startMinutes);
    const end = new Date(start);
    end.setUTCMinutes(startMinutes + pkg.durationMin);
    await prisma.booking.create({ data: { name: `Client ${i + 1}`, email: `client${i + 1}@example.com`, phone: Math.random() > 0.5 ? `07${Math.floor(100000000 + Math.random() * 899999999)}` : null, notes: Math.random() > 0.5 ? 'Prefer evenings after 6pm' : null, status: pick(statuses), packageId: pkg.id, startTime: start, endTime: end } });
  }

  console.log('Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
