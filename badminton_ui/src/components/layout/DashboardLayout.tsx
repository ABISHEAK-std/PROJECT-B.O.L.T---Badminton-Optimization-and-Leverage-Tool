import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
    return (
        <div className="flex h-screen w-full bg-background text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative">
                {/* Header / Top Bar could go here if needed, but per design it seems minimal */}
                {/* We might want a top bar for 'John Doe' profile info as seen in image 1 */}
                <div className="absolute top-4 right-6 z-10 flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white">John Doe</p>
                        <p className="text-xs text-gray-400">180cm | Pro</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-primary/50 overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="h-full w-full p-6 pt-16 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
