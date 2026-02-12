import { useData } from '../context/DataContext';

export const useBadges = () => {
    const { notifications } = useData();

    // Helper to count unread by link prefix or keyword
    const countUnread = (prefixes: string[], keywords: string[]) => {
        if (!notifications) return 0; // Safety check
        return notifications.filter(n =>
            !n.read && (
                (n.link && prefixes.some(p => n.link!.startsWith(p))) ||
                keywords.some(k => n.title.toLowerCase().includes(k) || n.message.toLowerCase().includes(k))
            )
        ).length;
    };

    // 1. Care Pillar: Appointments, Visits
    const careBadge = countUnread(['/appointments', '/visits'], ['appointment', 'consult']);

    // 2. Finance: Billing, Benefits
    const financeBadge = countUnread(['/billing', '/financial', '/benefits'], ['bill', 'invoice', 'payment']);

    // 3. Community: Events, Community
    const communityBadge = countUnread(['/community', '/events'], ['event', 'webinar', 'community']);

    // 4. Records: Results, Meds, Immunization, History
    const recordsBadge = countUnread(
        ['/results', '/medications', '/immunization', '/medical-history', '/health'],
        ['result', 'lab', 'prescription', 'refill', 'immunization', 'vaccine']
    );

    // Individual counts for sidebar sub-items
    const newMedsCount = countUnread(['/medications'], ['prescription', 'refill', 'medication']);
    const newLabsCount = countUnread(['/results'], ['result', 'lab', 'report']);
    const newImmunizationsCount = countUnread(['/immunization'], ['immunization', 'vaccine', 'shot']);

    return {
        careBadge,
        financeBadge,
        communityBadge,
        recordsBadge,
        newMedsCount,
        newLabsCount,
        newImmunizationsCount
    };
};
