import { Sidebar } from './Sidebar';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

export function DashboardLayout() {
    const { userProfile } = useAuth();

    return (
        <div className="flex h-screen w-full bg-background text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative">
                {/* Header / Top Bar with dynamic user info */}
                <Link 
                    to="/profile"
                    className="absolute top-4 right-6 z-10 flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 pr-4 rounded-xl transition-all"
                >
                    <div className="text-right">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                            {userProfile?.displayName || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {userProfile?.height || '---'}cm | {userProfile?.skillLevel || 'N/A'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-primary/50 overflow-hidden group-hover:border-primary transition-colors">
                        {userProfile?.photoURL ? (
                            <img 
                                src={userProfile.photoURL} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                        )}
                    </div>
                </Link>

                <div className="h-full w-full p-6 pt-16 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
