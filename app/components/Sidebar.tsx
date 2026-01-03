'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Database, LayoutDashboard, PlusCircle, Upload, BarChart3, LogOut, Settings, List } from 'lucide-react';

interface User {
    email: string;
    name: string;
    role: string;
    token: string;
}

interface SidebarProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        sessionStorage.removeItem('census_user');
        sessionStorage.removeItem('census_login_time');
        localStorage.removeItem('census_form_draft');
        router.push('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
        { href: '/add_page', icon: PlusCircle, label: 'Ajouter' },
        { href: '/records', icon: List, label: 'Enregistrements' },
        { href: '/import_page', icon: Upload, label: 'Importer' },
        { href: '/analytics', icon: BarChart3, label: 'Analyses' },
        { href: '/settings', icon: Settings, label: 'Paramètres' },
    ];

    return (
        <aside
            className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            {/* Close button for mobile */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-base sm:text-lg text-gray-900 truncate">Recensement</h1>
                        <p className="text-xs text-gray-500 truncate">Plateforme de Données</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={onClose}
                        >
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </a>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
