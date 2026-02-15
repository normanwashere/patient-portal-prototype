import React from 'react';

export type ContentType = 'event' | 'news' | 'guide' | 'campaign' | 'feature';

export interface BaseContent {
    id: string;
    type: ContentType;
    title: string;
    summary: string; // Unified description
    date: string;
    image: string;
    featured?: boolean;
    author?: string;
    category?: string;
    tenantId?: string; // Optional: If set, only visible to specific tenant
}

export interface ArticleContent extends BaseContent {
    type: 'news' | 'guide' | 'campaign' | 'feature';
    content?: React.ReactNode; // HTML or Component content
    readTime?: string;
    url?: string; // External URL if applicable
}

export interface EventContent extends BaseContent {
    type: 'event';
    time: string;
    location: string;
    address?: string;
    spots?: number;
    registeredCount?: number;
    registered?: boolean;
    requirements?: string[];
    organizer?: string;
    content?: React.ReactNode; // HTML description of the event
}

export type ContentItem = ArticleContent | EventContent;

export const ALL_CONTENT: ContentItem[] = [
    // --- EVENTS (Migrated from events.ts) ---
    {
        id: '1',
        title: 'Free Blood Sugar Screening',
        summary: 'Join us for a free blood sugar screening event! Early detection of diabetes can help prevent serious health complications.',
        date: 'Feb 15, 2024',
        time: '8:00 AM - 12:00 PM',
        location: 'MediLink Wellness Center',
        address: '123 Health Ave, Makati City',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
        spots: 50,
        registeredCount: 23,
        registered: false,
        featured: true,
        organizer: 'MediLink Health',
        requirements: ['Fasting for 8-12 hours', 'Bring valid ID', 'Wear comfortable clothing'],
        category: 'Screening',
        tenantId: 'maxicare',
        content: `
            <div class="space-y-6">
                <p class="text-lg font-medium text-gray-800">
                    Take control of your health with early detection. Diabetes often shows no symptoms until it's advanced. Our free screening utilizes HbA1c testing for accurate results.
                </p>
                
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span class="text-xl">📋</span> Preparation Checklist
                    </h4>
                    <ul class="space-y-2 text-blue-800">
                        <li class="flex items-start gap-2">
                             <span class="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                             <span>Fast for 8-10 hours prior to your slot (water is allowed).</span>
                        </li>
                        <li class="flex items-start gap-2">
                             <span class="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                             <span>Bring your Maxicare card or a valid government ID.</span>
                        </li>
                        <li class="flex items-start gap-2">
                             <span class="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                             <span>Wear loose-fitting clothing with sleeves that can be easily rolled up.</span>
                        </li>
                    </ul>
                </div>

                <div class="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">!</div>
                    <div>
                        <p class="font-bold text-gray-900">Immediate Results</p>
                        <p class="text-sm text-gray-600">Your results will be available within 24 hours via this Patient Portal.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: '2',
        title: 'Heart Health Webinar',
        summary: 'Learn how to keep your heart healthy in this exclusive webinar with top cardiologists.',
        date: 'Feb 20, 2024',
        time: '2:00 PM - 3:00 PM',
        location: 'Online via Zoom',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
        spots: 200,
        registeredCount: 145,
        registered: true,
        featured: true,
        organizer: 'Heart Foundation',
        requirements: ['Stable internet connection', 'Zoom installed'],
        category: 'Webinar',
        tenantId: 'maxicare',
        content: `
            <div class="space-y-6">
                <p class="text-lg text-gray-800">
                    Cardiovascular disease remains the top killer in the Philippines. Join <strong>Dr. Jose Mari Del Rosario</strong>, top Interventional Cardiologist, for an hour of life-saving information.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-bold text-red-800 mb-2">Topic 1: Silent Symptoms</h4>
                        <p class="text-sm text-red-700">Identifying the subtle signs of heart disease before it's too late.</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-bold text-red-800 mb-2">Topic 2: Stress & The Heart</h4>
                        <p class="text-sm text-red-700">How chronic workplace stress affects your cardiac health.</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-bold text-red-800 mb-2">Topic 3: Dietary Swaps</h4>
                        <p class="text-sm text-red-700">Making Filipino favorites heart-healthy without losing flavor.</p>
                    </div>
                     <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-bold text-red-800 mb-2">Q&A Session</h4>
                        <p class="text-sm text-red-700">20 minutes dedicated to answering your specific questions.</p>
                    </div>
                </div>

                <div class="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <p class="font-bold text-purple-900">🎁 Exclusive for Attendees</p>
                    <p class="text-sm text-purple-800">All participants get a chance to win a premium Digital Blood Pressure Monitor!</p>
                </div>
            </div>
        `
    },
    {
        id: '3',
        title: 'Flu Vaccination Drive',
        summary: 'Protect yourself and your family this season. Get your flu shot at our community drive.',
        date: 'Feb 25, 2024',
        time: '9:00 AM - 4:00 PM',
        location: 'City Health Center',
        address: '45 Civic Dr, Quezon City',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800',
        spots: 100,
        registeredCount: 67,
        registered: false,
        organizer: 'City Health Dept',
        requirements: ['Vaccination card (if any)', 'Valid ID'],
        category: 'Vaccination Drive'
    },
    {
        id: '4',
        title: 'Wellness Wednesday: Yoga',
        summary: 'Start your day with mindfulness and movement. Open to all fitness levels.',
        date: 'Feb 28, 2024',
        time: '6:00 AM - 7:00 AM',
        location: 'MediLink Garden',
        address: 'Rooftop Garden, MediLink Bldg',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        spots: 30,
        registeredCount: 12,
        registered: false,
        organizer: 'Wellness Team',
        requirements: ['Yoga mat', 'Water bottle', 'Comfortable clothes'],
        category: 'Wellness'
    },
    {
        id: '5',
        title: 'Community Health Fair',
        summary: 'A day of fun and health for the whole family! Free checkups, games, and prizes.',
        date: 'Mar 10, 2024',
        time: '8:00 AM - 5:00 PM',
        location: 'Municipal Gym',
        address: 'Town Plaza',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
        spots: 500,
        registeredCount: 250,
        registered: false,
        featured: true,
        organizer: 'Local Govt',
        requirements: ['None - Open to all!'],
        category: 'Health Fair'
    },

    // --- METRO GENERAL EVENTS (Need 3+) ---
    {
        id: 'metro-pedia-day',
        title: 'Pediatric Wellness Day',
        summary: 'Fun games, free dental checks, and nutrition talks for kids and parents.',
        date: 'March 20, 2026',
        time: '9:00 AM - 3:00 PM',
        location: 'Metro General Garden Area',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
        spots: 100,
        registeredCount: 45,
        registered: false,
        featured: true,
        organizer: 'Pediatrics Dept',
        category: 'Family Event',
        tenantId: 'metroGeneral',
        content: `
             <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Health is fun at Metro General! Bring your little ones for a day of learning, play, and free health services.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div class="p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <h4 class="font-bold text-pink-700 mb-2">🎈 For Kidz</h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li>• Face Painting & Balloon Art</li>
                        <li>• Meet "Dr. Bear" (Mascot)</li>
                        <li>• Interactive Storytelling</li>
                    </ul>
                </div>
                 <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 class="font-bold text-blue-700 mb-2">👨‍👩‍👧 For Parents</h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li>• Nutrition Talk: "Eating for Brain Power"</li>
                        <li>• Dental Hygiene Workshop</li>
                        <li>• One-on-one with Pediatricians</li>
                    </ul>
                </div>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">Free Services:</h4>
            <div class="space-y-2 mb-6">
                 <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <span class="text-red-500 font-bold">🦷</span>
                    <span>Fluoride Application (First 50 kids)</span>
                 </div>
                 <div class="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <span class="text-green-500 font-bold">👀</span>
                    <span>Vision Screening</span>
                 </div>
            </div>
        `
    },
    {
        id: 'metro-senior-walk',
        title: 'Senior Cardio Walk',
        summary: 'A gentle morning walk followed by heart-healthy breakfast for our seniors.',
        date: 'March 25, 2026',
        time: '6:30 AM - 9:00 AM',
        location: 'Rizal Park Meeting Point',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        spots: 50,
        registeredCount: 30,
        registered: false,
        organizer: 'Geriatrics Dept',
        category: 'Fitness',
        tenantId: 'metroGeneral'
    },
    {
        id: 'metro-maternity-open',
        title: 'Maternity Wing Open House',
        summary: 'Expecting? Take a tour of our state-of-the-art labor and delivery suites.',
        date: 'April 2, 2026',
        time: '1:00 PM - 4:00 PM',
        location: 'Metro General - 5th Floor',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800',
        spots: 20,
        registeredCount: 5,
        registered: false,
        organizer: 'OB-GYN Dept',
        category: 'Open House',
        tenantId: 'metroGeneral',
        content: `
             <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Every birth is special. See where your journey begins. We invite expectant parents to tour our newly renovated Maternity Wing.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Tour Highlights:</h4>
            <ul class="space-y-4 mb-8">
                <li class="flex gap-4">
                    <div class="w-24 h-16 bg-gray-200 rounded overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-900">Private Birthing Suites</h5>
                        <p class="text-sm text-gray-600">Home-like atmosphere with medical-grade safety.</p>
                    </div>
                </li>
                 <li class="flex gap-4">
                    <div class="w-24 h-16 bg-gray-200 rounded overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=200" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-900">NICU Capability</h5>
                        <p class="text-sm text-gray-600">Level 3 NICU providing the highest level of care for premature infants.</p>
                    </div>
                </li>
            </ul>

            <div class="bg-purple-50 p-4 rounded-lg flex gap-3 text-purple-900 text-sm">
                <span class="text-2xl">🎁</span>
                <div>
                   <strong>Exclusive Sign-up Perk:</strong> Book your delivery package on the day of the tour and get a free "New Mom" pampering kit.
                </div>
            </div>
        `
    },

    // --- METRO GENERAL GUIDES (Need 3+) ---
    {
        id: 'metro-childbirth',
        title: 'Preparing for Childbirth: A Guide',
        category: 'Maternity',
        summary: 'What to pack, when to come in, and what to expect during labor.',
        image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1200',
        readTime: '6 min read',
        date: 'Feb 15, 2026',
        author: 'Dr. Maria Santos',
        type: 'guide',
        tenantId: 'metroGeneral',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-pink-500 pl-4 bg-pink-50 py-2 rounded-r-lg mb-6">
                Preparing for your baby's arrival is an exciting time. Here is a guide to help you feel ready for the big day at Metro General Hospital.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Hospital Bag Checklist</h3>
            <div class="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div class="bg-pink-100 px-4 py-2 border-b">
                    <h4 class="font-bold text-pink-800">For Mom</h4>
                </div>
                <ul class="p-4 space-y-2 list-disc pl-5">
                    <li>Valid Government ID & PhilHealth ID</li>
                    <li>Comfortable nightgown and robe</li>
                    <li>Toiletries and slippers</li>
                    <li>Nursing bra and pads</li>
                </ul>
                <div class="bg-blue-100 px-4 py-2 border-b border-t">
                    <h4 class="font-bold text-blue-800">For Baby</h4>
                </div>
                 <ul class="p-4 space-y-2 list-disc pl-5">
                    <li>Newborn diapers and wipes</li>
                    <li>Going-home outfit</li>
                    <li>Receiving blanket</li>
                    <li>Mittens, socks, and bonnet</li>
                </ul>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">When to Come to the Hospital</h3>
            <p>
                Come to the emergency room if:
            </p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>Your water breaks</li>
                <li>Contractions are 5 minutes apart, lasting 1 minute, for at least 1 hour (5-1-1 Rule)</li>
                <li>You have heavy bleeding or severe pain</li>
            </ul>
        `
    },
    {
        id: 'metro-hypertension',
        title: 'Managing Hypertension at Home',
        category: 'Chronic Care',
        summary: 'Tips for monitoring your BP and cooking low-sodium meals.',
        image: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=1200',
        readTime: '5 min read',
        date: 'Jan 20, 2026',
        author: 'Cardiology Dept',
        type: 'guide',
        tenantId: 'metroGeneral',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                High blood pressure can act as a "silent killer," causing damage without symptoms. Controlling it is key to preventing heart attack and stroke.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">The DASH Diet</h3>
            <p>
                Dietary Approaches to Stop Hypertension (DASH) is a flexible and balanced eating plan.
            </p>
            <div class="grid grid-cols-2 gap-4 mt-4 mb-6">
                <div class="bg-green-50 p-4 rounded text-center">
                    <span class="block text-2xl">🥬</span>
                    <span class="font-bold text-green-800">Eat More</span>
                    <p class="text-xs">Fruits, Veggies, Whole Grains</p>
                </div>
                 <div class="bg-red-50 p-4 rounded text-center">
                    <span class="block text-2xl">🧂</span>
                    <span class="font-bold text-red-800">Eat Less</span>
                    <p class="text-xs">Sodium, Red Meat, Added Sugar</p>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Monitoring Tips</h3>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>Measure at the same time every day.</li>
                <li>Sit quietly for 5 minutes before measuring.</li>
                <li>Avoid caffeine or exercise 30 minutes before.</li>
                <li>Keep a log of your readings to show your doctor.</li>
            </ul>
        `
    },
    {
        id: 'metro-vax-schedule',
        title: '2026 Child Vaccination Schedule',
        category: 'Pediatrics',
        summary: 'Keep your child protected. View the updated immunization calendar.',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200',
        readTime: '3 min read',
        date: 'Jan 10, 2026',
        author: 'Pediatrics Dept',
        type: 'guide',
        tenantId: 'metroGeneral',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-indigo-500 pl-4 bg-indigo-50 py-2 rounded-r-lg mb-6">
                Vaccination is one of the most effective ways to protect your child from serious diseases. Metro General conforms to the PPIAP (Philippine Pediatric Society) standards.
            </p>

            <div class="overflow-x-auto mt-8">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3">Age</th>
                            <th scope="col" class="px-6 py-3">Vaccine</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white border-b">
                            <td class="px-6 py-4 font-bold text-gray-900">At Birth</td>
                            <td class="px-6 py-4">BCG, Hepatitis B</td>
                        </tr>
                        <tr class="bg-white border-b">
                            <td class="px-6 py-4 font-bold text-gray-900">6 Weeks</td>
                            <td class="px-6 py-4">DTaP, Hib, Polio, PCV, Rotavirus</td>
                        </tr>
                         <tr class="bg-white border-b">
                            <td class="px-6 py-4 font-bold text-gray-900">9 Months</td>
                            <td class="px-6 py-4">Measles</td>
                        </tr>
                         <tr class="bg-white border-b">
                            <td class="px-6 py-4 font-bold text-gray-900">12 Months</td>
                            <td class="px-6 py-4">MMR, Varicella, Hepatitis A</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="mt-6 text-sm text-gray-500 italic">
                * This is a general guide. Please consult with your pediatrician for a personalized vaccination schedule, especially if your child has missed any doses.
            </p>
        `
    },

    // --- MAXICARE CAMPAIGNS (Need 3+) ---
    {
        id: 'maxicare-prima-sandwich',
        title: 'PRIMA: The Safety Net for the Sandwich Generation',
        summary: 'Juggling care for kids and aging parents? PRIMA offers prepaid plans for every generation.',
        date: 'Feb 1, 2026',
        image: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=1200',
        author: 'MaxiHealth',
        category: 'Product Launch',
        type: 'campaign', // Switched to campaign to fit product promo
        tenantId: 'maxicare',
        content: `
             <p class="text-lg text-gray-800 leading-relaxed mb-6 font-medium">
                Are you part of the "sandwich generation"—juggling Zoom meetings, soothing a cranky toddler, and caring for an aging parent? You can't pour from an empty cup.
            </p>

            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <h4 class="font-bold text-indigo-900 mb-4">A Plan for Every Generation:</h4>
                <div class="space-y-4">
                    <div class="flex items-start gap-4">
                        <span class="bg-white p-2 rounded-lg shadow-sm text-2xl">👶</span>
                        <div>
                            <h5 class="font-bold text-gray-900">PRIMA for Babies (₱4,999)</h5>
                            <p class="text-sm text-gray-600">Unlimited basic pediatric care + free 6-in-1 vaccine for the first year.</p>
                        </div>
                    </div>
                     <div class="flex items-start gap-4">
                        <span class="bg-white p-2 rounded-lg shadow-sm text-2xl">🤰</span>
                        <div>
                            <h5 class="font-bold text-gray-900">PRIMA for Moms (₱16,499)</h5>
                            <p class="text-sm text-gray-600">Unlimited OB-GYN consults for all 3 trimesters.</p>
                        </div>
                    </div>
                     <div class="flex items-start gap-4">
                        <span class="bg-white p-2 rounded-lg shadow-sm text-2xl">👴</span>
                        <div>
                            <h5 class="font-bold text-gray-900">PRIMA for Seniors (From ₱2,099)</h5>
                            <p class="text-sm text-gray-600">Specialized plans for Hypertension and Diabetes monitoring.</p>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-gray-700 mb-6 font-medium italic">
                PRIMA cards offer simple, worry-free access to 37 Maxicare Primary Care Clinics nationwide. No paperwork, no surprise bills.
            </p>

            <a href="#" class="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Shop PRIMA Plans
            </a>
        `
    },
    {
        id: 'maxicare-diabetes-love',
        title: 'How to Say “I Love You” in a Diabetes-Friendly Way',
        summary: 'This Valentine’s Day, think about loved ones managing diabetes. Here are tips for a heart-healthy celebration.',
        image: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=1200',
        date: 'Feb 14, 2026',
        author: 'Wellness Team',
        category: 'Wellness',
        type: 'news',
        tenantId: 'maxicare',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6 font-serif italic text-center text-red-700 bg-red-50 p-4 rounded-lg">
                "While a day of indulgence may seem harmless, a series of 'dasurv ko ‘to' moments can seriously impact health."
            </p>

            <p class="text-gray-800 mb-6">
                In the Philippines, about <strong>2 in 10 adults</strong> are prediabetic. If someone you care about has diabetes, simple choices make a big difference.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Tips for a Sweet (but Safe) Valentine's:</h4>
            
            <div class="space-y-6 mb-8">
                <div>
                    <h5 class="font-bold text-red-600 text-lg">1. Craft a Personalized Gift</h5>
                    <p class="text-gray-700">Ditch the chocolate box. A handcrafted accessory, a curated playlist, or a customized gift stands out and feels more genuine.</p>
                </div>
                <div>
                    <h5 class="font-bold text-red-600 text-lg">2. Create New Memories</h5>
                    <p class="text-gray-700">Take a nature walk, visit a museum, or meet for coffee. Grand or simple, spending meaningful time together beats sugary treats.</p>
                </div>
                <div>
                    <h5 class="font-bold text-red-600 text-lg">3. Go Healthy but Lovely</h5>
                    <p class="text-gray-700">Cooking a homemade low-carb meal is a thoughtful way to show love. Be cautious with "sugar-free" candies that may cause discomfort.</p>
                </div>
            </div>

            <div class="bg-gray-900 text-white p-6 rounded-xl mt-8">
                 <h4 class="font-bold text-xl mb-2">Give the Gift of Peace of Mind</h4>
                 <p class="mb-4 opacity-90">PRIMA for Diabetes (₱2,099) includes essential tests like HBA1C, lipid profile, and doctor consults.</p>
                 <button class="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition">Get PRIMA Voucher</button>
            </div>
        `
    },
    {
        id: 'crush-2026',
        title: 'Lock In to Crush 2026!',
        date: 'January 10, 2026',
        author: 'Maxicare Wellness Team',
        category: 'Wellness Campaign',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
        summary: 'Start your year with power and purpose! Join our biggest wellness initiative yet.',
        type: 'campaign',
        featured: false,
        tenantId: 'maxicare'
    },

    // --- MAXICARE NEWS (Need 3+) ---


    {
        id: 'maxicare-mph-partnership',
        title: 'Strategic Partnership with Metro Pacific Health',
        date: 'January 15, 2026',
        author: 'Corporate Comms',
        category: 'Partnership',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
        summary: 'Broadening access to healthcare: Members can now access services across the entire MPH hospital network.',
        type: 'news',
        tenantId: 'maxicare',
        content: `
            <p class="text-xl font-bold text-blue-900 mb-4">Bigger Network, Better Care.</p>
            <p class="text-gray-800 mb-6 leading-relaxed">
                Maxicare Healthcare Corporation has formalized a strategic alliance with Metro Pacific Health (MPH), the largest private hospital group in the Philippines. This historic partnership bridges the gap between financing and care delivery.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">What this means for you:</h4>
            <div class="space-y-6">
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Streamlined LOA Issuance</h5>
                        <p class="text-sm text-gray-600">Automated approvals and paperless transactions at premier hospitals including Makati Med, Asian Hospital, and Cardinal Santos.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">2</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Exclusive Member Rates</h5>
                        <p class="text-sm text-gray-600">Special discounts on Executive Check-ups and Wellness Packages for all active Maxicare members.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">3</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Priority Queuing</h5>
                        <p class="text-sm text-gray-600">Dedicated concierge services for Maxicare patients at MPH admitting sections, reducing wait times by up to 50%.</p>
                    </div>
                </div>
            </div>

            <div class="mt-8 bg-blue-900 text-white p-6 rounded-xl">
                <p class="text-center italic">"Together, we are building a future where quality healthcare is accessible to every Filipino."</p>
            </div>
        `
    },
    {
        id: 'maxicare-ease-series',
        title: 'Launch of "Ease Series" Insurance Plans',
        date: 'January 10, 2026',
        author: 'Product Team',
        category: 'Product Launch',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200',
        summary: 'Making insurance simple. Flexible and affordable plans designed for every Filipino family.',
        type: 'news',
        tenantId: 'maxicare'
    },

    // --- METRO GENERAL CAMPAIGNS (Need 3+) ---
    {
        id: 'metro-onecare',
        title: 'Experience the OneCare Program',
        date: 'February 1, 2026',
        author: 'Patient Experience',
        category: 'Service Excellence',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200',
        summary: 'Our commitment to you: Integrated, patient-centered care from admission to discharge.',
        type: 'campaign',
        featured: true,
        tenantId: 'metroGeneral',
        content: `
            <div class="text-center mb-8">
                <p class="text-3xl font-light text-blue-900">"Treating the patient, not just the disease."</p>
                <div class="h-0.5 w-16 bg-blue-300 mx-auto mt-4"></div>
            </div>

            <p class="text-lg text-gray-800 mb-6 leading-relaxed">
                Navigating the healthcare system can be overwhelming. That's why we launched <strong>Metro General OneCare</strong>—a holistic approach that ensures your journey is seamless, supported, and personalized.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Key Pillars of OneCare:</h4>
            <div class="space-y-6 mb-8">
                <div class="flex gap-4">
                    <span class="block text-3xl">🧑‍⚕️</span>
                    <div>
                        <h5 class="font-bold text-gray-900">Dedicated Care Coordinator</h5>
                        <p class="text-sm text-gray-600">One point person to handle your scheduling, billing queries, and insurance processing.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <span class="block text-3xl">📱</span>
                    <div>
                        <h5 class="font-bold text-gray-900">Continuous Digital Monitoring</h5>
                        <p class="text-sm text-gray-600">Access your lab results and doctor's notes in real-time via the Patient Portal.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <span class="block text-3xl">🏠</span>
                    <div>
                        <h5 class="font-bold text-gray-900">Transitional Care</h5>
                        <p class="text-sm text-gray-600">We don't just discharge you; we ensure you recover safely at home with follow-up calls and teleconsults.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'metro-fight-flu',
        title: 'Fight Flu Together',
        date: 'June 1, 2026',
        author: 'Infection Control',
        category: 'Prevention',
        image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=1200',
        summary: 'Get vaccinated and learn proper hygiene to keep our community safe this rainy season.',
        type: 'campaign',
        featured: false,
        tenantId: 'metroGeneral',
        content: `
                                                                                                                                                                                                                                                                                    `
    },
    {
        id: 'metro-preferred-status',
        title: 'Preferred Status: Fast-Track Admissions',
        date: 'March 1, 2026',
        author: 'Admissions',
        category: 'Service Update',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        summary: 'Accredited HMO members now enjoy priority lanes and express discharge clearance.',
        type: 'campaign',
        featured: false,
        tenantId: 'metroGeneral'
    },

    // --- METRO GENERAL NEWS (Need 3+) ---
    {
        id: 'metro-new-wing',
        title: 'Inauguration of Advanced Nuclear Medicine Center',
        summary: 'Metro General opens its doors to the most advanced cancer diagnostic facility in the region.',
        date: 'Feb 12, 2026',
        type: 'news',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
        category: 'Hospital News',
        featured: true,
        tenantId: 'metroGeneral',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Metro General Hospital takes a giant leap forward in cancer care with the opening of our standalone <strong>Nuclear Medicine Center</strong>.
            </p>

            <div class="mb-8">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800" class="w-full h-48 object-cover rounded-xl mb-4" />
                <p class="text-sm text-gray-500 italic text-center">Ribbon cutting ceremony led by Hospital Director Dr. Ricardo Lim.</p>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">Cutting-Edge Technology:</h4>
            <ul class="space-y-4 mb-8">
                <li class="p-4 border rounded-lg">
                    <h5 class="font-bold text-blue-900">PET-CT Scan (64-slice)</h5>
                    <p class="text-sm text-gray-600 mt-1">Allows for precise localization of tumors and monitoring of treatment response with minimal radiation exposure.</p>
                </li>
                <li class="p-4 border rounded-lg">
                    <h5 class="font-bold text-blue-900">SPECT Gamma Camera</h5>
                    <p class="text-sm text-gray-600 mt-1">Advanced imaging for cardiac, bone, and renal studies.</p>
                </li>
            </ul>

            <div class="bg-blue-900 text-white p-6 rounded-xl">
                <p class="font-bold mb-2">For Appointments:</p>
                <p class="text-blue-200">Contact the Nuclear Med reception at local 1024 or book via this app.</p>
            </div>
        `
    },
    {
        id: 'metro-jci',
        title: 'Metro General Earns JCI Gold Seal Approval',
        summary: 'We have been accredited by the Joint Commission International for upholding global standards in patient safety.',
        date: 'Jan 15, 2026',
        type: 'news',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
        category: 'Awards',
        featured: true,
        tenantId: 'metroGeneral',
        content: `
            <div class="flex flex-col items-center text-center mb-8">
                <div class="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-5xl border-8 border-yellow-200 mb-4">🥇</div>
                <h3 class="text-2xl font-bold text-gray-900">World-Class Healthcare.</h3>
                <p class="text-gray-600">Right here in the Metro.</p>
            </div>

            <p class="text-lg text-gray-800 mb-6 leading-relaxed">
                Metro General Hospital has once again achieved the <strong>Gold Seal of Approval®</strong> from Joint Commission International (JCI), the world's leader in health care accreditation.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">What determines JCI Accreditation?</h4>
            <p class="text-gray-700 mb-4">
                An independent team of expert surveyors evaluated Metro General on over 1,000 measurable elements, including:
            </p>
            <ul class="space-y-2 list-disc pl-5 mb-8">
                <li>International Patient Safety Goals</li>
                <li>Medication Management & Use</li>
                <li>Infection Prevention & Control</li>
                <li>Facility Management & Safety</li>
            </ul>

            <div class="p-4 bg-gray-50 border-l-4 border-yellow-400 italic text-gray-600">
                "This accreditation is a signal to our patients that we have volunteered for a rigorous evaluation of our performance and demonstrated a commitment to delivering safe, high-quality care."
            </div>
        `
    },
    {
        id: 'metro-nursing-excellence',
        title: 'Celebrating Nursing Excellence Awards',
        summary: 'Recognizing our nurses who go above and beyond in delivering compassionate care.',
        date: 'March 5, 2026',
        type: 'news',
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
        category: 'People',
        tenantId: 'metroGeneral'
    },

    // --- HEALTH GUIDES (Migrated from HealthGuideDetail.tsx) ---
    {
        id: 'diabetes-control',
        title: '5 Lifestyle Changes to Help Control Your Diabetes',
        category: 'Chronic Care',
        summary: 'Small daily habits that make a big difference in managing blood sugar levels effectively.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/5-lifestyle-changes-to-help-control-your-diabetes/',
        date: 'Feb 10, 2026',
        author: 'Dr. Sarah Smith',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg">
                Before developing type 2 diabetes, most people have prediabetes in which their blood sugar is higher than normal but not high enough yet for a diabetes diagnosis. The good news is that prediabetes can be reversed.
            </p>
            <p class="mb-6">
                Apart from getting quality healthcare, there’s no better way to treat your diabetes than to live a healthier lifestyle. Here are five actionable changes you can make today to jumpstart your journey to living your best life.
            </p>

            <div class="space-y-8 mt-8">
                <div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2">1. Upgrade Your Plate</h3>
                    <p>
                        Instead of strict deprivation, focus on adding nutrients. Fill half your plate with non-starchy vegetables like leafy greens and broccoli. Swap refined grains for whole grains like quinoa or brown rice. These high-fiber foods help slow digestion and prevent blood sugar spikes.
                    </p>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2">2. Move Your Body Daily</h3>
                    <p>
                        You don't need a gym membership to stay active. Aim for at least 30 minutes of moderate activity, like brisk walking, every day. Regular movement helps your cells use insulin more effectively, keeping your blood sugar in check and maintaining a healthy weight.
                    </p>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2">3. Prioritize Quality Sleep</h3>
                    <p>
                        Sleep is often overlooked in diabetes management. Lack of sleep can mess with your hormones, leading to increased appetite and insulin resistance. Aim for 7-9 hours of quality sleep each night to give your body the rest it needs to regulate blood sugar.
                    </p>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2">4. Quit Bad Habits</h3>
                    <p>
                        Smoking and excessive alcohol consumption can worsen diabetes complications like heart disease and nerve damage. Quitting smoking is one of the best things you can do for your health. If you drink alcohol, do so in moderation and always with food to prevent low blood sugar.
                    </p>
                </div>

                <div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2">5. Monitor and Set Goals</h3>
                    <p>
                        You can't manage what you don't measure. Regular blood sugar monitoring helps you understand how different foods and activities affect your body. Set small, achievable goals, such as "walk for 10 minutes after dinner" rather than "lose 50 pounds," to build sustainable momentum.
                    </p>
                </div>
            </div>

            <div class="mt-8 p-6 bg-green-50 rounded-xl border border-green-100">
                <h4 class="font-bold text-green-900 mb-2">You don't have to do it alone</h4>
                <p class="text-green-800 text-sm">
                    With Maxicare, you can take charge of your own body and live your best life while managing your diabetes. Our BestLife Wellness Program offers screening and maintenance medication programs for registered members.
                </p>
            </div>
        `
    },
    {
        id: 'gallstones',
        title: 'Cholelithiasis: How to Avoid Gallstones',
        category: 'Prevention',
        summary: 'Understanding the risk factors and dietary changes to keep your gallbladder healthy.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
        readTime: '4 min read',
        url: 'https://www.maxicare.com.ph/health-guides/cholelithiasis-how-to-avoid-gallstones/',
        date: 'Jan 28, 2026',
        author: 'Medical Team',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Cholelithiasis is the condition of having gallstones in your gallbladder, a small organ that stores bile. While some gallstones are harmless, others can cause severe pain and complications.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Understanding Gallstones</h3>
            <p>
                Gallstones are hardened deposits of digestive fluid that can form in your gallbladder. They range in size from as small as a grain of sand to as large as a golf ball. Some people develop just one gallstone, while others develop many at the same time.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Common Signs & Symptoms</h3>
            <p>Gallstones may cause no signs or symptoms. If a gallstone lodges in a duct and causes a blockage, the resulting signs and symptoms may include:</p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>Sudden and rapidly intensifying pain in the upper right portion of your abdomen</li>
                <li>Sudden and rapidly intensifying pain in the center of your abdomen, just below your breastbone</li>
                <li>Back pain between your shoulder blades</li>
                <li>Pain in your right shoulder</li>
                <li>Nausea or vomiting</li>
            </ul>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Prevention Strategies</h3>
            <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-800">1. Watch Your Weight</h4>
                    <p class="text-sm mt-1">Obesity increases the risk of developing gallstones. Aim for a healthy weight, but avoid rapid weight loss, as crash diets can actually increase your risk.</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-800">2. Eat More Fiber</h4>
                    <p class="text-sm mt-1">Include more fiber-rich foods in your diet, such as fruits, vegetables, and whole grains. Fiber helps protect against gallstones.</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-800">3. Stick to Healthy Fats</h4>
                    <p class="text-sm mt-1">Olive oil and fish oil are great sources of unsaturated fats that can help keep your gallbladder empty and healthy.</p>
                </div>
            </div>
        `
    },
    {
        id: 'kidney-stones',
        title: 'How Can You Prevent Kidney Stones? 3 Practical Ways',
        category: 'Kidney Health',
        summary: 'Hydration and diet tips to prevent painful kidney stones before they start.',
        image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1200',
        readTime: '3 min read',
        url: 'https://www.maxicare.com.ph/health-guides/how-can-you-prevent-kidney-stones-check-out-these-3-practical-ways/',
        date: 'Jan 15, 2026',
        author: 'Nutrition Dept',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Kidney stones are hard deposits made of minerals and salts that form inside your kidneys. Passing kidney stones can be quite painful, but the stones usually cause no permanent damage if they're recognized in a timely fashion.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-4 mt-8">3 Key Prevention Tips</h3>

            <div class="space-y-6">
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">Hydrate, Hydrate, Hydrate</h4>
                        <p class="mt-2 text-gray-600">
                            Drinking water is the best way to prevent kidney stones. If you don't drink enough, your urine output will be low. Low urine output means your urine is more concentrated and less likely to dissolve urine salts that cause stones.
                        </p>
                        <p class="mt-2 text-sm bg-blue-50 p-2 rounded text-blue-800 inline-block font-medium">Goal: Drink about 8 to 12 cups of fluid per day.</p>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">Eat Calcium-Rich Foods</h4>
                        <p class="mt-2 text-gray-600">
                            The most common type of kidney stone is the calcium oxalate stone. Many people believe they should avoid calcium without realizing that a diet low in calcium may actually increase their risk of kidney stones and osteoporosis.
                        </p>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">Reduce Sodium Intake</h4>
                        <p class="mt-2 text-gray-600">
                            A high-sodium diet can trigger kidney stones because it increases the amount of calcium in your urine. A low-sodium diet is recommended for the stone prone.
                        </p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'prostate-cancer',
        title: 'Prostate Cancer: What You Need To Know',
        category: 'Men\'s Health',
        summary: 'Early detection signs and improved treatment options for prostate health.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200',
        readTime: '6 min read',
        url: 'https://www.maxicare.com.ph/health-guides/prostate-cancer-what-you-need-to-know/',
        date: 'Jan 10, 2026',
        author: 'Oncology Dept',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Prostate cancer is one of the most common types of cancer. Many prostate cancers grow slowly and are confined to the prostate gland, where they may not cause serious harm. However, while some types of prostate cancer grow slowly and may need minimal or even no treatment, other types are aggressive and can spread quickly.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Who is at risk?</h3>
            <p>Factors that can increase your risk of prostate cancer include:</p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li><strong>Older age:</strong> Your risk of prostate cancer increases as you age. It's most common after age 50.</li>
                <li><strong>Race:</strong> For reasons not yet determined, black people carry a greater risk of prostate cancer than do people of other races.</li>
                <li><strong>Family history:</strong> If a blood relative, such as a parent, sibling or child, has been diagnosed with prostate cancer, your risk may be increased.</li>
                <li><strong>Obesity:</strong> People who are obese may have a higher risk of prostate cancer compared with people considered to have a healthy weight.</li>
            </ul>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Screening and Diagnosis</h3>
            <p>
                Prostate screening usually involves a digital rectal exam (DRE) and a test to measure prostate-specific antigen (PSA) levels in your blood. Discuss the pros and cons of prostate cancer screening with your doctor to decide if it's right for you.
            </p>

            <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="font-bold text-blue-900">Treatment Options</h4>
                <p class="text-sm mt-1 mb-2">Treatment depends on several factors, including how fast the cancer is growing and your overall health.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">Active Surveillance</span>
                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">Surgery</span>
                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">Radiation Therapy</span>
                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">Hormone Therapy</span>
                </div>
            </div>
        `
    },
    {
        id: 'chronic-kidney',
        title: 'Chronic Kidney Disease: What You Need To Know',
        category: 'Kidney Health',
        summary: 'Managing CKD through lifestyle, diet, and regular monitoring.',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200',
        readTime: '7 min read',
        url: 'https://www.maxicare.com.ph/health-guides/chronic-kidney-disease-what-you-need-to-know/',
        date: 'Jan 05, 2026',
        author: 'Medical Team',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Chronic kidney disease (CKD) means your kidneys are damaged and can't filter blood the way they should. The disease is called "chronic" because the damage to your kidneys happens slowly over a long period of time.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">The Silent Progression</h3>
            <p>
                Early chronic kidney disease usually has no signs or symptoms. You might not realize you have kidney disease until the condition is advanced.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Managing CKD</h3>
            <p>While damage to your kidneys is usually permanent, you can take steps to keep your kidneys as healthy as possible for as long as possible.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-blue-800 mb-2">Control Blood Pressure</h4>
                    <p class="text-sm text-gray-600">High blood pressure can damage your kidneys. Keep it less than 140/90 mm Hg.</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-blue-800 mb-2">Manage Blood Sugar</h4>
                    <p class="text-sm text-gray-600">If you have diabetes, the best way to protect your kidneys is to keep your blood sugar numbers in check.</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-blue-800 mb-2">Monitor Protein Intake</h4>
                    <p class="text-sm text-gray-600">Eating more protein than your body needs can burden your kidneys. A dietitian can help you determine the right amount.</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-blue-800 mb-2">Limit NSAIDs</h4>
                    <p class="text-sm text-gray-600">Pain relievers like ibuprofen can damage kidneys if taken regularly. Ask your doctor about safer alternatives.</p>
                </div>
            </div>
        `
    },
    {
        id: 'cholesterol-myths',
        title: '14 Cholesterol Myths Busted',
        category: 'Heart Health',
        summary: 'Separating fact from fiction when it comes to dietary cholesterol and heart health.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=1200',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/14-cholesterol-myths-busted/',
        date: 'Dec 28, 2025',
        author: 'Heart Center',
        type: 'guide',
        featured: true,
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Cholesterol often gets a bad rap, but it's essential for your body to function. Navigating the information available can be confusing. Let's clear up some common misconceptions.
            </p>

            <div class="space-y-6 mt-8">
                <div>
                    <h3 class="text-sm font-bold text-red-500 uppercase tracking-wide">Myth #1</h3>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">All cholesterol is bad for you.</h4>
                    <p class="pl-4 border-l-2 border-green-500">
                        <strong class="text-green-700">Fact:</strong> Your body needs some cholesterol to make hormones and build cells. "Good" cholesterol (HDL) actually helps remove "bad" cholesterol (LDL) from your arteries.
                    </p>
                </div>

                <div>
                    <h3 class="text-sm font-bold text-red-500 uppercase tracking-wide">Myth #2</h3>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">Eggs are bad for your heart.</h4>
                    <p class="pl-4 border-l-2 border-green-500">
                        <strong class="text-green-700">Fact:</strong> For most people, dietary cholesterol (like in eggs) has a smaller effect on blood cholesterol levels than saturated and trans fats do. Eggs are a great source of protein.
                    </p>
                </div>

                <div>
                    <h3 class="text-sm font-bold text-red-500 uppercase tracking-wide">Myth #3</h3>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">I would feel it if I had high cholesterol.</h4>
                    <p class="pl-4 border-l-2 border-green-500">
                        <strong class="text-green-700">Fact:</strong> High cholesterol usually has no signs or symptoms. You can have it without knowing it. The only way to know is to get your cholesterol checked.
                    </p>
                </div>

                <div>
                    <h3 class="text-sm font-bold text-red-500 uppercase tracking-wide">Myth #4</h3>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">Children don't need to worry about cholesterol.</h4>
                    <p class="pl-4 border-l-2 border-green-500">
                        <strong class="text-green-700">Fact:</strong> Hardening of the arteries can begin in childhood. Children with high cholesterol should control it through diet and exercise to prevent heart disease later in life.
                    </p>
                </div>

                <div>
                    <h3 class="text-sm font-bold text-red-500 uppercase tracking-wide">Myth #5</h3>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">Women don't need to worry about cholesterol.</h4>
                    <p class="pl-4 border-l-2 border-green-500">
                        <strong class="text-green-700">Fact:</strong> Heart disease is the leading cause of death for women. High cholesterol affects both men and women.
                    </p>
                </div>
            </div>
        `
    },
    {
        id: 'heart-disease',
        title: '5 Healthy Living Habits to Prevent Heart Disease',
        category: 'Heart Health',
        summary: 'Actionable steps to strengthen your heart and reduce cardiovascular risk.',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200',
        readTime: '4 min read',
        url: 'https://www.maxicare.com.ph/health-guides/5-healthy-living-habits-to-prevent-heart-disease/',
        date: 'Dec 20, 2025',
        author: 'Wellness Team',
        type: 'guide',
        featured: true,
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Heart disease is a leading cause of death, but it's not inevitable. While you can't change some risk factors — such as family history, sex or age — there are plenty of ways you can reduce your risk of heart disease.
            </p>

            <div class="space-y-6 mt-8">
                <div class="flex items-start gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">1</span>
                    <div>
                        <h4 class="font-bold text-lg">Don't Smoke or Use Tobacco</h4>
                        <p class="text-gray-600">Chemicals in tobacco can damage your heart and blood vessels. Cigarette smoke reduces the oxygen in your blood, which increases your blood pressure and heart rate.</p>
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">2</span>
                    <div>
                        <h4 class="font-bold text-lg">Get Moving: Aim for 30 Minutes Daily</h4>
                        <p class="text-gray-600">Regular daily physical activity can lower your risk of heart disease. Physical activity helps control your weight and reduce your chances of developing other conditions that may put a strain on your heart.</p>
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">3</span>
                    <div>
                        <h4 class="font-bold text-lg">Eat a Heart-Healthy Diet</h4>
                        <p class="text-gray-600">A diet rich in fruits, vegetables and whole grains can help protect your heart. Beans, other low-fat sources of protein and certain types of fish also can reduce your risk of heart disease.</p>
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">4</span>
                    <div>
                        <h4 class="font-bold text-lg">Maintain a Healthy Weight</h4>
                        <p class="text-gray-600">Being overweight — especially around your middle — increases your risk of heart disease. Excess weight can lead to conditions that increase your chances of heart disease.</p>
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">5</span>
                    <div>
                        <h4 class="font-bold text-lg">Get Quality Sleep</h4>
                        <p class="text-gray-600">People who don't get enough sleep have a higher risk of obesity, high blood pressure, heart attack, diabetes and depression.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'thyroid-cancer',
        title: 'Thyroid Cancer: What You Need to Know',
        category: 'Cancer Care',
        summary: 'Symbols, types, and treatment journeys for thyroid conditions.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/thyroid-cancer-what-you-need-to-know/',
        date: 'Dec 15, 2025',
        author: 'Oncology Dept',
        type: 'guide',
        tenantId: 'maxicare',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg mb-6">
                Thyroid cancer occurs in the cells of the thyroid — a butterfly-shaped gland located at the base of your neck. Your thyroid produces hormones that regulate your heart rate, blood pressure, body temperature and weight.
            </p>

            <h3 class="text-xl font-bold text-blue-900 mb-2 mt-8">Symptoms</h3>
            <p>Thyroid cancer typically doesn't cause any signs or symptoms early in the disease. As thyroid cancer grows, it may cause:</p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>A lump (nodule) that can be felt through the skin on your neck</li>
                <li>Changes to your voice, including increasing hoarseness</li>
                <li>Difficulty swallowing</li>
                <li>Pain in your neck and throat</li>
                <li>Swollen lymph nodes in your neck</li>
            </ul>

            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Types of Thyroid Cancer</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-3 bg-white rounded shadow-sm">
                        <span class="block font-bold text-blue-600">Papillary</span>
                        <span class="text-sm text-gray-600">Most common. Usually grows slowly.</span>
                    </div>
                    <div class="p-3 bg-white rounded shadow-sm">
                        <span class="block font-bold text-blue-600">Follicular</span>
                        <span class="text-sm text-gray-600">Second most common agent.</span>
                    </div>
                    <div class="p-3 bg-white rounded shadow-sm">
                        <span class="block font-bold text-blue-600">Medullary</span>
                        <span class="text-sm text-gray-600">Begins in thyroid C cells.</span>
                    </div>
                    <div class="p-3 bg-white rounded shadow-sm">
                        <span class="block font-bold text-blue-600">Anaplastic</span>
                        <span class="text-sm text-gray-600">Rare and grows quickly.</span>
                    </div>
                </div>
            </div>

            <p>
                Most thyroid cancers can be cured with treatment. Treatment options include surgery, hormone therapy, radioactive iodine, radiation therapy, and in some cases, chemotherapy.
            </p>
        `
    },

    // --- EVENTS (Already defined above) ---
    {
        id: 'wellness-webinar',
        title: 'Summer Wellness Webinar',
        date: 'March 15, 2026',
        author: 'Dr. Emily Chen',
        category: 'Health Education',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        summary: 'Beat the heat and stay healthy! Join our experts for a deep dive into summer wellness.',
        type: 'event',
        time: '10:00 AM - 11:30 AM',
        location: 'Online Webinar',
        featured: true,
        tenantId: 'maxicare'
    },
    {
        id: 'family-health-fair',
        title: 'Family Health Fair 2026',
        date: 'April 5, 2026',
        author: 'Community Outreach',
        category: 'Community Event',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
        summary: 'A day of fun, fitness, and free health screenings for the whole family!',
        type: 'event',
        time: '9:00 AM - 5:00 PM',
        location: 'Maxicare Primary Care Center - BGC',
        featured: true,
        tenantId: 'maxicare'
    },
    {
        id: 'love-diabetes',
        title: 'How to Say "I Love You" in a Diabetes-Friendly Way',
        date: 'February 14, 2026',
        author: 'Nutrition Dept',
        category: 'Health Tips',
        image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=1200',
        summary: 'This Valentine\'s Day, show your love with heart-healthy choices that don\'t spike blood sugar.',
        type: 'guide',
        tenantId: 'maxicare'
    },

    // --- MERALCO WELLNESS CONTENT (Corporate/Industrial Focus) ---
    // Events
    {
        id: 'meralco-fun-run',
        title: 'Meralco Orange Fit Fun Run',
        summary: 'Join the annual 3k, 5k, and 10k run. Let\'s get fit together!',
        date: 'May 1, 2026',
        time: '5:00 AM - 9:00 AM',
        location: 'Meralco Compound',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        spots: 500,
        registeredCount: 340,
        registered: false,
        featured: true,
        organizer: 'Orange Fit Team',
        category: 'Sports',
        tenantId: 'meralcoWellness',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed border-l-4 border-orange-500 pl-4 mb-6">
                Lace up your running shoes! The Orange Fit Fun Run is back, bigger and better than ever. Whether you're a seasoned marathoner or a casual walker, there's a category for you.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                    <span class="block text-3xl font-bold text-orange-600">3K</span>
                    <span class="text-xs font-bold text-orange-800 uppercase">Fun Run</span>
                    <p class="text-xs text-gray-600 mt-2">Perfect for families & beginners.</p>
                </div>
                <div class="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                    <span class="block text-3xl font-bold text-orange-600">5K</span>
                    <span class="text-xs font-bold text-orange-800 uppercase">Power Run</span>
                    <p class="text-xs text-gray-600 mt-2">Challenge your personal best.</p>
                </div>
                <div class="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                    <span class="block text-3xl font-bold text-orange-600">10K</span>
                    <span class="text-xs font-bold text-orange-800 uppercase">Pro Run</span>
                    <p class="text-xs text-gray-600 mt-2">For the serious athlete.</p>
                </div>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">Registration Inclusions:</h4>
            <ul class="space-y-2 mb-6">
                <li class="flex items-center gap-2">
                    <span class="text-green-500">✔</span> Orange Fit Dri-Fit Shirt
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-green-500">✔</span> Race Bib with RFID Timing
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-green-500">✔</span> Finisher's Medal
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-green-500">✔</span> Loot Bag from Sponsors
                </li>
            </ul>

            <div class="bg-gray-100 p-4 rounded-lg">
                <p class="font-bold text-gray-800">Assembly Time:</p>
                <p class="text-sm text-gray-600">4:30 AM at the Meralco Football Field. Gun start is at 5:00 AM sharp for 10K runners.</p>
            </div>
        `
    },
    {
        id: 'meralco-safety-seminar',
        title: 'Target Zero: Electrical Safety Seminar',
        summary: 'Essential training for safe handling of electrical equipment and emergency response.',
        date: 'April 15, 2026',
        time: '1:00 PM - 5:00 PM',
        location: 'Training Hall A',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800',
        spots: 50,
        registeredCount: 45,
        registered: false,
        organizer: 'Safety Dept',
        category: 'Training',
        tenantId: 'meralcoWellness',
        content: `
            <p class="font-bold text-red-600 mb-4 uppercase tracking-wide text-sm">Mandatory for Field Technicians</p>
            <p class="text-lg text-gray-800 mb-6">
                Safety is our #1 priority. This comprehensive seminar covers the latest protocols in Arc Flash prevention and Lockout/Tagout procedures.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Course Outline:</h4>
            <div class="space-y-4 mb-8">
                <div class="flex gap-4">
                    <div class="w-16 font-bold text-gray-500">1:00 PM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Understanding Arc Flash Hazards</h5>
                        <p class="text-sm text-gray-600">Physics of an arc flash and risk assessment.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-16 font-bold text-gray-500">2:30 PM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Proper PPE Selection</h5>
                        <p class="text-sm text-gray-600">Choosing the right flame-resistant clothing and face shields.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-16 font-bold text-gray-500">3:30 PM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Emergency Response</h5>
                        <p class="text-sm text-gray-600">First aid for electrical burns and shock.</p>
                    </div>
                </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <span class="text-2xl">⚠️</span>
                <p class="text-sm text-yellow-800">
                    <strong>Reminder:</strong> Attendees must bring their company-issued safety vest and hard hat for the practical demonstration portion.
                </p>
            </div>
        `
    },

    {
        id: 'meralco-stress-mgmt',
        title: 'Mindfulness & Mental Wellness Workshop',
        summary: 'Techniques to manage high-pressure work environments, featuring guest speaker from PMHA.',
        date: 'April 20, 2026',
        time: '10:00 AM - 12:00 PM',
        location: 'Wellness Center Conf Room',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        spots: 30,
        registeredCount: 12,
        registered: false,
        organizer: 'HR Wellness',
        category: 'Mental Health',
        tenantId: 'meralcoWellness'
    },
    // Guides
    {
        id: 'meralco-ergonomics',
        title: 'Office Ergonomics 101',
        category: 'Work Safety',
        summary: 'Setup your workstation correctly to avoid back pain and eye strain.',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200',
        readTime: '4 min read',
        date: 'March 10, 2026',
        author: 'Physiotherapy Team',
        type: 'guide',
        tenantId: 'meralcoWellness',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-orange-500 pl-4 bg-orange-50 py-2 rounded-r-lg mb-6">
                Ergonomics is about fitting the task to the person, not the other way around. A proper workstation setup can prevent musculoskeletal disorders and boost your productivity.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">The 90-90-90 Rule</h3>
            <p>When sitting at your desk, aim for the 90-90-90 position:</p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>Elbows at a 90-degree angle</li>
                <li>Hips at a 90-degree angle</li>
                <li>Knees at a 90-degree angle</li>
            </ul>

            <div class="bg-gray-100 p-6 rounded-xl mt-6">
                <h4 class="font-bold text-gray-900 mb-2">Monitor Placement</h4>
                <p class="text-gray-700 mb-4">
                    Position your monitor about an arm's length away. The top of the screen should be at or slightly below eye level so you don't have to tilt your head up or down.
                </p>
                <div class="flex gap-2">
                    <span class="bg-white px-3 py-1 rounded shadow-sm text-sm font-medium text-orange-600">Avoid Glare</span>
                    <span class="bg-white px-3 py-1 rounded shadow-sm text-sm font-medium text-orange-600">Adjust Brightness</span>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">The 20-20-20 Rule</h3>
            <p>
                To prevent digital eye strain, follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for at least 20 seconds.
            </p>
        `
    },
    {
        id: 'meralco-shift-work',
        title: 'Surviving Shift Work: Sleep Tips',
        category: 'Sleep Health',
        summary: 'How to maintain a healthy sleep cycle when working rotating shifts.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
        readTime: '5 min read',
        date: 'Feb 28, 2026',
        author: 'Medical Clinic',
        type: 'guide',
        tenantId: 'meralcoWellness',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-orange-500 pl-4 bg-orange-50 py-2 rounded-r-lg mb-6">
                Shift work can disrupt your body's natural circadian rhythm, leading to fatigue and health issues. However, with the right strategies, you can thrive on any schedule.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Establish "Anchor Sleep"</h3>
            <p>
                If possible, try to keep at least 4 hours of your sleep overlap constant every day. For example, sleeping from 8 AM to 12 PM every day, regardless of your shift, can help stabilize your internal clock.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Create a Sleep Sanctuary</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <span class="block text-2xl mb-2">🌑</span>
                    <h4 class="font-bold text-sm">Darkness</h4>
                    <p class="text-xs text-gray-600">Use blackout curtains or an eye mask.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <span class="block text-2xl mb-2">🔇</span>
                    <h4 class="font-bold text-sm">Quiet</h4>
                    <p class="text-xs text-gray-600">Use earplugs or a white noise machine.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <span class="block text-2xl mb-2">❄️</span>
                    <h4 class="font-bold text-sm">Cool</h4>
                    <p class="text-xs text-gray-600">Keep the room temperature around 20°C.</p>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Nutrition for Night Shifts</h3>
            <p>
                Avoid heavy, greasy meals during the night shift. Opt for light snacks like fruits, nuts, and yogurt to keep your energy steady without the crash.
            </p>
        `
    },
    {
        id: 'meralco-energy-diet',
        title: 'Diet for High Energy',
        category: 'Nutrition',
        summary: 'Foods that sustain your energy levels throughout the workday without the crash.',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
        readTime: '3 min read',
        date: 'Feb 15, 2026',
        author: 'Nutritionist',
        type: 'guide',
        tenantId: 'meralcoWellness',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-orange-500 pl-4 bg-orange-50 py-2 rounded-r-lg mb-6">
                What you eat directly impacts your productivity. Ditch the sugary snacks and switch to foods that provide sustained energy throughout your shift.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">The Glycemic Index (GI)</h3>
            <p>
                Choose low-GI foods that release energy slowly. Examples include oats, whole grains, nuts, beans, and most vegetables. High-GI foods like white bread and sugary drinks cause a spike in blood sugar followed by a crash.
            </p>

            <div class="mt-8 border border-orange-200 rounded-xl overflow-hidden">
                <div class="bg-orange-100 px-6 py-4 border-b border-orange-200">
                    <h4 class="font-bold text-orange-900">Power Snacks Checklist</h4>
                </div>
                <div class="p-6 bg-orange-50">
                    <ul class="space-y-3">
                        <li class="flex items-center gap-3">
                            <span class="text-green-600">✓</span>
                            <span>Handful of Almonds or Walnuts</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-green-600">✓</span>
                            <span>Apple slices with Peanut Butter</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-green-600">✓</span>
                            <span>Greek Yogurt with Berries</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-green-600">✓</span>
                            <span>Hard-boiled Eggs</span>
                        </li>
                    </ul>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Hydration Matters</h3>
            <p>
                Dehydration is a common cause of fatigue. Keep a water bottle at your desk and aim to drink at least 2 liters of water daily.
            </p>
        `
    },
    // News/Campaigns
    {
        id: 'meralco-safety-milestone',
        title: 'Meralco Celebrates 5 Million Safe Man-Hours',
        summary: 'A testament to our unwavering commitment to safety in the workplace. Congratulations team!',
        date: 'March 1, 2026',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1200',
        author: 'Safety Dept',
        category: 'Milestone',
        type: 'news',
        tenantId: 'meralcoWellness',
        content: `
            <div class="text-center py-10 bg-gray-900 rounded-xl mb-8 relative overflow-hidden">
                <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <h2 class="text-5xl font-black text-orange-500 mb-2 relative z-10">5,000,000</h2>
                <h3 class="text-2xl font-bold text-white uppercase tracking-widest relative z-10">Safe Man-Hours</h3>
                <p class="text-gray-400 mt-2 relative z-10">Without a Lost Time Incident (LTI)</p>
            </div>

            <p class="text-lg text-gray-800 mb-6 leading-relaxed">
                This achievement is not just a number; it represents 5 million hours where every single Meralco employee went home safe to their families.
            </p>

            <div class="flex gap-4 items-start mb-8 bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <img src="https://ui-avatars.com/api/?name=Manuel+P&background=random" alt="CEO" class="w-12 h-12 rounded-full" />
                <div>
                    <h5 class="font-bold text-gray-900">Message from the CEO</h5>
                    <p class="italic text-gray-700 mt-2">"Safety is a core value that we live by every day. I commend the Safety Department and every line crew for being your brother's keeper. Let's aim for 10 million!"</p>
                </div>
            </div>

            <p class="font-bold text-gray-900 mb-2">To celebrate, we are:</p>
            <ul class="space-y-2 list-disc pl-5">
                <li>Distributing commemorative safety vests to all field personnel.</li>
                <li>Raffling off 50 Safety Shoe vouchers.</li>
                <li>Hosting a thanksgiving lunch at the quadrangle this Friday.</li>
            </ul>
        `
    },
    {
        id: 'meralco-gym-opening',
        title: 'New Executive Gym Opening',
        summary: 'Upgrade your fitness routine at our newly renovated gym facilities. Open 24/7 for shift workers.',
        date: 'March 5, 2026',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
        author: 'Facilities',
        category: 'Facility Update',
        type: 'news',
        tenantId: 'meralcoWellness'
    },
    {
        id: 'meralco-omf-mission',
        title: 'One Meralco Foundation: Medical Mission Success',
        summary: 'Over 500 families in Rizal served during our weekend medical mission.',
        date: 'Jan 10, 2026',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        author: 'CSR Team',
        category: 'CSR',
        type: 'news',
        featured: true,
        tenantId: 'meralcoWellness'
    },

    // --- HEALTHFIRST CLINIC CONTENT (Community/Primary Care Focus) ---
    // Events
    {
        id: 'healthfirst-williams-center',
        title: 'Grand Opening: HealthFirst Williams Center',
        summary: 'Visit our new multi-specialty hub in Mandaluyong. Diagnostics, Rehabilitation, and more.',
        date: 'April 10, 2026',
        time: '8:00 AM - 4:00 PM',
        location: 'Williams Center, Mandaluyong',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
        spots: 200,
        registeredCount: 150,
        registered: false,
        featured: true,
        organizer: 'Clinic Ops',
        category: 'Grand Opening',
        tenantId: 'healthFirst',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                We are bringing quality primary care closer to you in Mandaluyong! Join us as we open the doors to our newest and most advanced clinic yet.
            </p>

            <div class="bg-teal-50 p-6 rounded-xl border border-teal-100 mb-8">
                <h4 class="font-bold text-teal-900 mb-3">Opening Day Specials:</h4>
                <ul class="space-y-2 text-teal-800">
                    <li class="flex items-center gap-2"><span class="font-bold">FREE</span> Vital Signs Check for all visitors.</li>
                    <li class="flex items-center gap-2"><span class="font-bold">50% OFF</span> on basic laboratory packages.</li>
                    <li class="flex items-center gap-2"><span class="font-bold">FREE</span> Coffee and snacks from 8 AM to 12 NN.</li>
                </ul>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">Event Schedule:</h4>
            <div class="space-y-4">
                <div class="flex gap-4">
                    <div class="w-20 font-bold text-gray-500">8:00 AM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Ribbon Cutting</h5>
                        <p class="text-sm text-gray-600">With Mayor Abalos and HealthFirst Executives.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-20 font-bold text-gray-500">9:00 AM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Clinic Tours</h5>
                        <p class="text-sm text-gray-600">See our new Physio-Rehab equipment and 4D Ultrasound machines.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-20 font-bold text-gray-500">1:00 PM</div>
                    <div>
                        <h5 class="font-bold text-gray-900">Doctor Meet & Greet</h5>
                        <p class="text-sm text-gray-600">Free 10-minute consults with our Resident Family Physician.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'healthfirst-first-aid',
        title: 'Basic First Aid Training',
        summary: 'Learn life-saving skills including CPR and wound management.',
        date: 'April 25, 2026',
        time: '1:00 PM - 5:00 PM',
        location: 'HealthFirst Main Branch',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=800',
        spots: 20,
        registeredCount: 5,
        registered: false,
        organizer: 'Red Cross Partner',
        category: 'Training',
        tenantId: 'healthFirst',
        content: `
            <p class="text-lg text-gray-800 mb-6">
                Would you know what to do in an emergency? Equip yourself with the skills to save a life. This hands-on workshop is open to the public (ages 16+).
            </p>

            <h4 class="font-bold text-gray-900 mb-4">What You Will Learn:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <span class="block text-2xl mb-2">❤️</span>
                    <h5 class="font-bold text-gray-900">CPR & AED</h5>
                    <p class="text-sm text-gray-600">Proper chest compressions and how to use an automated defibrillator.</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <span class="block text-2xl mb-2">🩹</span>
                    <h5 class="font-bold text-gray-900">Wound Care</h5>
                    <p class="text-sm text-gray-600">Stopping bleeding, cleaning wounds, and bandaging.</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <span class="block text-2xl mb-2">🦴</span>
                    <h5 class="font-bold text-gray-900">Broken Bones</h5>
                    <p class="text-sm text-gray-600">Splinting techniques and immobilization.</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <span class="block text-2xl mb-2">🔥</span>
                    <h5 class="font-bold text-gray-900">Burns & Scalds</h5>
                    <p class="text-sm text-gray-600">Determining burn severity and immediate treatment.</p>
                </div>
            </div>

            <div class="flex items-center gap-4 bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div class="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📜</div>
                <div>
                    <p class="font-bold text-teal-900">Certification Included</p>
                    <p class="text-sm text-teal-700">Receive a Certificate of Participation valid for 2 years upon completion.</p>
                </div>
            </div>
        `
    },
    {
        id: 'healthfirst-dengue-talk',
        title: 'Dengue Awareness Talk',
        summary: 'Protect your family from Dengue. Learn symptoms and prevention tips.',
        date: 'May 5, 2026',
        time: '10:00 AM - 11:30 AM',
        location: 'HealthFirst Conference Room',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
        spots: 50,
        registeredCount: 20,
        registered: false,
        organizer: 'Public Health Unit',
        category: 'Health Talk',
        tenantId: 'healthFirst'
    },
    // Guides
    {
        id: 'healthfirst-dengue-signs',
        title: 'Recognizing Dengue Symptoms',
        category: 'Prevention',
        summary: 'Know the warning signs of severe dengue and when to go to the hospital.',
        image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200',
        readTime: '3 min read',
        date: 'March 15, 2026',
        author: 'Dr. Tan',
        type: 'guide',
        tenantId: 'healthFirst',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-red-500 pl-4 bg-red-50 py-2 rounded-r-lg mb-6">
                Dengue fever is a mosquito-borne viral disease that is widespread in the Philippines. Early recognition of symptoms is crucial for preventing complications.
            </p>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Common Symptoms</h3>
            <p>Symptoms usually begin 4-10 days after infection and last for 2-7 days. Look out for:</p>
            <ul class="space-y-2 list-disc pl-5 mt-2 mb-6">
                <li>High fever (40°C / 104°F)</li>
                <li>Severe headache & pain behind the eyes</li>
                <li>Muscle and joint pain</li>
                <li>Nausea and vomiting</li>
                <li>Swollen glands</li>
                <li>Rash</li>
            </ul>

            <div class="bg-red-50 border border-red-200 rounded-lg p-6 my-6">
                <h3 class="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span class="text-2xl">⚠️</span> WARNING SIGNS
                </h3>
                <p class="text-red-800 mb-4 font-medium">Go to the emergency room immediately if you observe:</p>
                <ul class="space-y-2 text-red-700">
                    <li>• Severe abdominal pain</li>
                    <li>• Persistent vomiting</li>
                    <li>• Bleeding gums or nose leads</li>
                    <li>• Rapid breathing</li>
                    <li>• Fatigue / restlessness</li>
                </ul>
            </div>

            <p>
                There is no specific treatment for dengue fever. Patients should rest, stay hydrated, and seek medical advice. Do not take aspirin or ibuprofen as they can increase the risk of bleeding.
            </p>
        `
    },

    {
        id: 'healthfirst-budget-nutrition',
        title: 'Nutrition on a Budget',
        category: 'Healthy Living',
        summary: 'Eat healthy without breaking the bank. Affordable nutritious meals.',
        image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200',
        readTime: '5 min read',
        date: 'Jan 25, 2026',
        author: 'Dietician Mary',
        type: 'guide',
        tenantId: 'healthFirst',
        content: `
            <p class="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-green-500 pl-4 bg-green-50 py-2 rounded-r-lg mb-6">
                Healthy eating doesn't have to be expensive. With a little planning, you can nourish your body while sticking to your budget.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-green-700 mb-2">Buy Seasonal</h4>
                    <p class="text-sm text-gray-600">Fruits and vegetables are cheaper and tastier when they are in season in the Philippines (e.g., Mangoes in summer, Lanzones in Oct).</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-green-700 mb-2">Plant Protein</h4>
                    <p class="text-sm text-gray-600">Beans (monggo), tofu, and eggs are affordable, high-quality protein sources compared to meat.</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-green-700 mb-2">Cook in Bulk</h4>
                    <p class="text-sm text-gray-600">Prepare large batches of meals (adobo, sinigang) and freeze leftovers. This saves time and money.</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-green-700 mb-2">Drink Water</h4>
                    <p class="text-sm text-gray-600">Skip sugary sodas and juices. Water is free and essential for your health.</p>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2 mt-8">Smart Swaps</h3>
            <ul class="space-y-2 mt-2 bg-gray-50 p-4 rounded-lg">
                <li class="flex justify-between">
                    <span class="text-red-500 line-through">Fast Food Meal (₱150)</span>
                    <span class="text-green-600 font-bold">Home Cooked Meal (₱50)</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-red-500 line-through">Chips (₱40)</span>
                    <span class="text-green-600 font-bold">Banana (₱10)</span>
                </li>
            </ul>
        `
    },
    // News
    {
        id: 'healthfirst-cebu-expansion',
        title: 'HealthFirst Expands to Cebu IT Park',
        summary: 'We are excited to bring quality primary care to the Queen City of the South. Visit our new Mega-Clinic.',
        date: 'March 10, 2026',
        image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200',
        author: 'Expansion Team',
        category: 'Company News',
        type: 'news',
        featured: true,
        tenantId: 'healthFirst',
        content: `
            <p class="text-xl font-bold text-teal-700 mb-4">Maayong Balita, Cebu!</p>
            <p class="text-lg text-gray-800 mb-6 font-medium">
                HealthFirst is officially open at the heart of Cebu IT Park.
            </p>
            <p class="text-gray-700 mb-6">
                Located at the Ground Floor of TGU Tower, our new Mega-Clinic is designed to serve the thousands of BPO professionals and residents in the area. We are open from 6:00 AM to 10:00 PM daily.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Clinic Features:</h4>
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="flex items-center gap-3">
                    <span class="text-teal-500 text-xl">✓</span>
                    <span class="text-gray-700">Full Laboratory</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-teal-500 text-xl">✓</span>
                    <span class="text-gray-700">X-Ray & Ultrasound</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-teal-500 text-xl">✓</span>
                    <span class="text-gray-700">Dental Clinic</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-teal-500 text-xl">✓</span>
                    <span class="text-gray-700">Physical Therapy</span>
                </div>
            </div>

            <div class="p-6 bg-gray-900 text-white rounded-xl text-center">
                <p class="font-bold mb-2">Grand Opening Promo</p>
                <p class="text-sm opacity-90">First 500 patients get a FREE HealthFirst Care Kit (Thermometer, Alcohol, Bandages).</p>
            </div>
        `
    },
    {
        id: 'healthfirst-pagibig-promo',
        title: '10% Off for Pag-IBIG Loyalty Card Holders',
        summary: 'Present your card to get discounts on labs and consults at any HealthFirst branch.',
        date: 'Feb 1, 2026',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200',
        author: 'Marketing',
        category: 'Promo',
        type: 'campaign', // Mark as campaign
        featured: false,
        tenantId: 'healthFirst',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Maximizing your government benefits just got easier! HealthFirst Clinic is now an accredited partner of the Pag-IBIG Loyalty Card.
            </p>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
                <div class="flex-shrink-0 text-6xl">💳</div>
                <div>
                    <h4 class="font-bold text-blue-900 text-xl mb-2">Exclusive Discounts</h4>
                    <ul class="space-y-2 text-blue-800 font-medium">
                        <li>• <span class="font-bold text-blue-600">20% OFF</span> on Laboratory Tests</li>
                        <li>• <span class="font-bold text-blue-600">15% OFF</span> on X-Ray and Ultrasound</li>
                        <li>• <span class="font-bold text-blue-600">10% OFF</span> on Dental Procedures</li>
                    </ul>
                </div>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">How to Avail:</h4>
            <ol class="list-decimal pl-5 space-y-3 text-gray-700 mb-6">
                <li>Present your valid Pag-IBIG Loyalty Card Plus upon registration.</li>
                <li>Valid ID must also be presented for verification.</li>
                <li>Discount applies to cash and credit card payments only (not applicable for HMO coverage).</li>
            </ol>

            <p class="text-sm text-gray-500 italic">
                *Promo runs until December 31, 2026. Cannot be used in conjunction with other promos or senior citizen discounts.
            </p>
        `
    },
    {
        id: 'healthfirst-konsulta',
        title: 'Now Accredited: PhilHealth Konsulta',
        summary: 'Avail of free consultations and medicines using your PhilHealth ID.',
        date: 'Jan 15, 2026',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        author: 'Admin',
        category: 'Insurance',
        type: 'news',
        tenantId: 'healthFirst',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Good news! HealthFirst is now an accredited <strong>PhilHealth Konsulta</strong> provider. This means more accessible healthcare for all Filipinos.
            </p>

            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl mb-8">
                <h4 class="font-bold text-xl mb-4">What is FREE under Konsulta?</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-center gap-2">
                        <span class="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Consultations</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Health Risk Screening</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Selected Lab Tests</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Selected Medicines</span>
                    </div>
                </div>
            </div>

            <h4 class="font-bold text-gray-900 mb-4">How to Register:</h4>
            <ol class="space-y-4 list-decimal pl-5 text-gray-700">
                <li>Log in to the PhilHealth Member Portal on their website.</li>
                <li>Go to "Konsulta Registration".</li>
                <li>Search for "HealthFirst" and select your preferred branch.</li>
                <li>Wait for the confirmation slip and present it at our clinic.</li>
            </ol>
        `
    },
    // --- QUOTA FILLERS (Meralco) ---
    {
        id: 'meralco-employee-benefits',
        title: 'Updated Employee Wellness Benefits',
        summary: 'Review the new subsidies available for gym memberships and mental health apps.',
        date: 'Jan 20, 2026',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200',
        author: 'HR',
        category: 'Benefits',
        type: 'news',
        tenantId: 'meralcoWellness'
    },
    {
        id: 'meralco-hydration-challenge',
        title: 'Orange Fit: 30-Day Hydration Challenge',
        summary: 'Track your water intake and win prizes! Stay hydrated for better focus.',
        date: 'May 1, 2026',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200',
        author: 'Wellness Comm',
        category: 'Challenge',
        type: 'campaign',
        tenantId: 'meralcoWellness',
        content: `
            <div class="bg-blue-500 text-white p-6 rounded-xl text-center mb-8">
                <span class="block text-4xl mb-2">💧</span>
                <h3 class="text-2xl font-bold">Drink Water. Feel Better. Win Big.</h3>
            </div>

            <p class="text-lg text-gray-800 mb-6">
                Did you know that even mild dehydration can cause fatigue and difficulty concentrating? Join the Orange Fit Hydration Challenge and build a healthy habit that lasts.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">How to Join:</h4>
            <div class="space-y-4 mb-8">
                <div class="flex items-center gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
                    <p>Register via the Orange Fit portal.</p>
                </div>
                <div class="flex items-center gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</span>
                    <p>Log your daily water intake (Goal: 8 glasses/day).</p>
                </div>
                <div class="flex items-center gap-4">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</span>
                    <p>Complete 30 days to earn the title of "Hydro Hero".</p>
                </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="font-bold text-gray-900 mb-2">🎉 Rewards</p>
                <ul class="text-sm text-gray-700 space-y-1">
                    <li>• First 100 registrants get a free <strong>Orange Fit Tumbler</strong>.</li>
                    <li>• Finishers get a raffle entry for a Smartwatch.</li>
                </ul>
            </div>
        `
    },

    {
        id: 'meralco-bike-to-work',
        title: 'Bike to Work Week',
        summary: 'Promoting eco-friendly commuting and physical activity. Secure bike parking available.',
        date: 'June 1, 2026',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200',
        author: 'Facilities',
        category: 'Eco-Health',
        type: 'campaign',
        tenantId: 'meralcoWellness',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Save money, save the planet, and get a workout in—all before 8 AM. We're encouraging all employees to pedal their way to the office this week.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">Cyclist Amenities:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div class="p-4 border rounded-lg">
                    <span class="block text-2xl mb-2">🚿</span>
                    <h5 class="font-bold text-gray-900">Shower Facilities</h5>
                    <p class="text-sm text-gray-600">Available at the basement of the Main Building & fitness center.</p>
                </div>
                <div class="p-4 border rounded-lg">
                    <span class="block text-2xl mb-2">🅿️</span>
                    <h5 class="font-bold text-gray-900">Secure Parking</h5>
                    <p class="text-sm text-gray-600">Designated bike racks with 24/7 security monitoring.</p>
                </div>
                <div class="p-4 border rounded-lg">
                    <span class="block text-2xl mb-2">🛠️</span>
                    <h5 class="font-bold text-gray-900">Repair Station</h5>
                    <p class="text-sm text-gray-600">Free use of air pump and basic tools at the parking entrance.</p>
                </div>
            </div>

            <div class="bg-green-50 p-4 rounded-lg text-green-800 text-sm">
                <strong>Did you know?</strong> Biking to work burns an average of 500 calories per hour and reduces your carbon footprint by 90% compared to driving.
            </div>
        `
    },

    // --- QUOTA FILLERS (HealthFirst) ---
    {
        id: 'healthfirst-telemedicine-launch',
        title: 'Telemedicine Now Available',
        summary: 'Consult with our doctors from the comfort of your home. Beta launch.',
        date: 'Feb 10, 2026',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        author: 'Digital Health', category: 'Service Update',
        type: 'news',
        tenantId: 'healthFirst'
    },
    {
        id: 'healthfirst-kids-nutrition',
        title: 'Healthy Kids, Happy Kids',
        summary: 'Month-long campaign focusing on child nutrition and fighting malnutrition.',
        date: 'July 1, 2026',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1200',
        author: 'Pediatrics',
        category: 'Child Health',
        type: 'campaign',
        tenantId: 'healthFirst',
        content: `
            <p class="text-lg text-gray-800 leading-relaxed mb-6">
                Proper nutrition in the first few years of life is critical. Join our campaign to fight stunting and ensure every child reaches their full potential.
            </p>

            <h4 class="font-bold text-gray-900 mb-4">The "Pinggang Pinoy" for Kids</h4>
            <div class="flex justify-center mb-8">
                <div class="w-64 h-64 rounded-full border-4 border-gray-200 relative bg-white shadow-sm overflow-hidden flex flex-wrap">
                    <div class="w-1/2 h-1/2 bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-800 p-2 text-center">Go (Rice/Bread)</div>
                    <div class="w-1/2 h-1/2 bg-green-100 flex items-center justify-center text-xs font-bold text-green-800 p-2 text-center">Glow (Veggies)</div>
                    <div class="w-1/2 h-1/2 bg-red-100 flex items-center justify-center text-xs font-bold text-red-800 p-2 text-center">Grow (Fish/Meat)</div>
                    <div class="w-1/2 h-1/2 bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-800 p-2 text-center">Fruit</div>
                </div>
            </div>

            <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="font-bold text-yellow-900 mb-2">📢 Free Vitamin Distribution</p>
                <p class="text-sm text-yellow-800 mb-2">We are giving away free Zinc and Vitamin C drops for children aged 1-5 years old.</p>
                <p class="text-xs text-gray-500">Available every Saturday of July at all HealthFirst branches. While stocks last.</p>
            </div>
        `
    },
    {
        id: 'healthfirst-quit-smoking',
        title: 'Quit Smoking Support Group',
        summary: 'Join our free support group and start your journey to a smoke-free life.',
        date: 'Aug 1, 2026',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200',
        author: 'Pulmonary Dept',
        category: 'Lifestyle',
        type: 'campaign',
        tenantId: 'healthFirst'
    }
];
