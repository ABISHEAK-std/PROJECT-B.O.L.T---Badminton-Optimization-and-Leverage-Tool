import { useState, useMemo } from 'react';
import { FilterBar } from '../components/history/FilterBar';
import { SessionCard } from '../components/history/SessionCard';
import { WeeklySummary } from '../components/history/WeeklySummary';
import { SessionBreakdown } from '../components/history/SessionBreakdown';
import { useSessions } from '../hooks/useLiveData';
import type { ArchivedSession } from '../services/liveDataService';
import { Loader2, FolderOpen } from 'lucide-react';

export default function SessionHistory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSession, setSelectedSession] = useState<ArchivedSession | null>(null);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    
    const { sessions, loading } = useSessions();

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions;
        
        const query = searchQuery.toLowerCase();
        return sessions.filter(session =>
            session.date?.toLowerCase().includes(query) ||
            session.sessionId?.toLowerCase().includes(query) ||
            String(session.score).includes(query)
        );
    }, [sessions, searchQuery]);
    
    const handleViewBreakdown = (session: ArchivedSession) => {
        setSelectedSession(session);
        setIsBreakdownOpen(true);
    };
    
    const handleCloseBreakdown = () => {
        setIsBreakdownOpen(false);
        setTimeout(() => setSelectedSession(null), 300);
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Session History & Archives</h1>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - List */}
                <div className="col-span-12 lg:col-span-9 flex flex-col h-full">
                    <FilterBar onSearch={setSearchQuery} />

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                                <p className="text-gray-400">Loading sessions from Firebase...</p>
                            </div>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <FolderOpen size={64} className="text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">No Sessions Found</h3>
                                <p className="text-gray-500 max-w-md">
                                    {searchQuery 
                                        ? `No sessions match "${searchQuery}". Try a different search.`
                                        : 'Start a live analysis session to see your training history here. Sessions are automatically saved when you stop recording.'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-10">
                            {filteredSessions.map((session) => (
                                <SessionCard 
                                    key={session.id} 
                                    session={session}
                                    onViewBreakdown={handleViewBreakdown}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className="col-span-12 lg:col-span-3">
                    <WeeklySummary sessions={sessions} />
                </div>
            </div>
            
            {/* Session Breakdown Modal */}
            <SessionBreakdown
                session={selectedSession}
                isOpen={isBreakdownOpen}
                onClose={handleCloseBreakdown}
            />
        </div>
    );
}
