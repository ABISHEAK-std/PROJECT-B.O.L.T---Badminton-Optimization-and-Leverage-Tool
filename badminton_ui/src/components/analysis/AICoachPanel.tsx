import { MessageSquare } from 'lucide-react';

const insights = [
    { time: '14:32', text: 'Excellent follow-through on that last overhead clear! Maintain that rotation.' },
    { time: '14:31', text: 'Footwork sequence for the dropshot was precise. Good job maintaining balance.' },
    { time: '14:29', text: 'Consider earlier preparation for the net shot to increase deception. Focus on a quick wrist flick.' },
    { time: '14:27', text: 'Smash speed is consistent, but focus on racket head acceleration for more penetrating power. Try driving through the shuttle more.' },
];

export function AICoachPanel() {
    // TODO: Subscribe to Firebase 'insights' collection for real-time updates
    return (
        <div className="h-full flex flex-col glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-mono">AI Coaching Insights</h2>
                <MessageSquare size={20} className="text-gray-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl border-l-2 border-primary/50 hover:bg-white/10 transition-colors">
                        <p className="text-sm text-gray-200 leading-relaxed">
                            {insight.text}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block font-mono">
                            {insight.time}
                        </span>
                    </div>
                ))}

                {/* Mocking "live" incoming message opacity gradient */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
