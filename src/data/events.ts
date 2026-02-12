export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    address?: string;
    type: 'Health Fair' | 'Webinar' | 'Vaccination Drive' | 'Screening' | 'Wellness';
    image: string;
    spots: number;
    registeredCount?: number; // Number of people registered
    registered: boolean; // Whether current user is registered
    featured: boolean;
    organizer?: string;
    requirements?: string[];
}

export const EVENTS_DATA: Event[] = [
    {
        id: '1',
        title: 'Free Blood Sugar Screening',
        description: `Join us for a free blood sugar screening event! Early detection of diabetes can help prevent serious health complications.

**What to Expect:**
- Fasting blood glucose test
- HbA1c test for those with elevated results
- One-on-one consultation with our endocrinologist
- Free healthy snacks after testing
- Educational materials on diabetes prevention

**Who Should Attend:**
- Adults 40 years and above
- Those with family history of diabetes
- Individuals with BMI over 25
- Anyone experiencing symptoms (frequent urination, excessive thirst, unexplained weight loss)`,
        date: 'Feb 15, 2024',
        time: '8:00 AM - 12:00 PM',
        location: 'MediLink Wellness Center',
        address: '123 Health Ave, Makati City',
        type: 'Screening',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
        spots: 50,
        registeredCount: 23,
        registered: false,
        featured: true,
        organizer: 'MediLink Health',
        requirements: ['Fasting for 8-12 hours', 'Bring valid ID', 'Wear comfortable clothing']
    },
    {
        id: '2',
        title: 'Heart Health Webinar',
        description: `Learn how to keep your heart healthy in this exclusive webinar with top cardiologists.

**Topics Covered:**
- Understanding blood pressure and cholesterol
- Diet and exercise for heart health
- Recognizing signs of heart attack
- Q&A Session`,
        date: 'Feb 20, 2024',
        time: '2:00 PM - 3:00 PM',
        location: 'Online via Zoom',
        type: 'Webinar',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
        spots: 200,
        registeredCount: 145,
        registered: true,
        featured: true,
        organizer: 'Heart Foundation',
        requirements: ['Stable internet connection', 'Zoom installed']
    },
    {
        id: '3',
        title: 'Flu Vaccination Drive',
        description: 'Protect yourself and your family this season. Get your flu shot at our community drive.',
        date: 'Feb 25, 2024',
        time: '9:00 AM - 4:00 PM',
        location: 'City Health Center',
        address: '45 Civic Dr, Quezon City',
        type: 'Vaccination Drive',
        image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800',
        spots: 100,
        registeredCount: 67,
        registered: false,
        featured: false,
        organizer: 'City Health Dept',
        requirements: ['Vaccination card (if any)', 'Valid ID']
    },
    {
        id: '4',
        title: 'Wellness Wednesday: Yoga',
        description: 'Start your day with mindfulness and movement. Open to all fitness levels.',
        date: 'Feb 28, 2024',
        time: '6:00 AM - 7:00 AM',
        location: 'MediLink Garden',
        address: 'Rooftop Garden, MediLink Bldg',
        type: 'Wellness',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        spots: 30,
        registeredCount: 12,
        registered: false,
        featured: false,
        organizer: 'Wellness Team',
        requirements: ['Yoga mat', 'Water bottle', 'Comfortable clothes']
    },
    {
        id: '5',
        title: 'Community Health Fair',
        description: 'A day of fun and health for the whole family! Free checkups, games, and prizes.',
        date: 'Mar 10, 2024',
        time: '8:00 AM - 5:00 PM',
        location: 'Municipal Gym',
        address: 'Town Plaza',
        type: 'Health Fair',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
        spots: 500,
        registeredCount: 250,
        registered: false,
        featured: true,
        organizer: 'Local Govt',
        requirements: ['None - Open to all!']
    }
];
