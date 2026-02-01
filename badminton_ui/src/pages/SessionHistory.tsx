import { useState, useMemo } from 'react';
import { FilterBar } from '../components/history/FilterBar';
import { SessionCard } from '../components/history/SessionCard';
import { WeeklySummary } from '../components/history/WeeklySummary';

// TODO: Replace with Firebase fetch from /sessions collection
const MOCK_SESSIONS = [
    { id: 1, date: 'October 26, 2023', score: '8.7', thumbnail: 'https://images.pexels.com/photos/11502153/pexels-photo-11502153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 2, date: 'October 24, 2023', score: '9.1', thumbnail: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 3, date: 'October 22, 2023', score: '8.4', thumbnail: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 4, date: 'October 19, 2023', score: '9.3', thumbnail: 'https://images.pexels.com/photos/8007137/pexels-photo-8007137.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 5, date: 'October 17, 2023', score: '8.9', thumbnail: 'https://images.pexels.com/photos/6293527/pexels-photo-6293527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 6, date: 'October 15, 2023', score: '8.6', thumbnail: 'https://images.pexels.com/photos/3651674/pexels-photo-3651674.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

export default function SessionHistory() {
    const [searchQuery, setSearchQuery] = useState('');

    // TODO: Implement complex filtering logic here if needed
    const filteredSessions = useMemo(() => {
        return MOCK_SESSIONS.filter(session =>
            session.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.score.includes(searchQuery)
        );
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full gap-6">
            <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Session History & Archives</h1>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - List */}
                <div className="col-span-12 lg:col-span-9 flex flex-col h-full">
                    <FilterBar onSearch={setSearchQuery} />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-10">
                        {filteredSessions.map((session) => (
                            <SessionCard key={session.id} {...session} />
                        ))}
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="col-span-12 lg:col-span-3">
                    <WeeklySummary />
                </div>
            </div>
        </div>
    );
}
