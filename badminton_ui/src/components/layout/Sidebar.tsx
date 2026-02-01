import { Home, History, BarChart2, User, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
    { icon: Home, label: 'Analysis Hub', path: '/' },
    { icon: History, label: 'Session History', path: '/history' },
    { icon: BarChart2, label: 'Stats', path: '/stats' }, 
    { icon: User, label: 'Profile', path: '/profile' }, 
];

export function Sidebar() {
    const { userProfile } = useAuth();

    return (
        <div className="h-screen w-20 flex flex-col items-center bg-[#0D0D0D] border-r border-white/10 py-6">
            {/* Logo */}
            <div className="mb-10 w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/50">
                <Activity size={24} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-6 w-full items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative group",
                                isActive
                                    ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(223,255,0,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className={cn("transition-transform duration-300", isActive && "scale-110")} />

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                {/* Tooltip */}
                                <div className="absolute left-14 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50 pointer-events-none">
                                    {item.label}
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Avatar - Dynamic */}
            <NavLink 
                to="/profile"
                className="mt-auto w-10 h-10 rounded-full border border-white/20 overflow-hidden hover:border-primary/50 transition-colors"
            >
                {userProfile?.photoURL ? (
                    <img 
                        src={userProfile.photoURL} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center">
                        <User size={18} className="text-gray-400" />
                    </div>
                )}
            </NavLink>
        </div>
    );
}
