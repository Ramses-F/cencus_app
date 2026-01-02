'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface User {
    email: string;
    name: string;
    role: string;
    token: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Check authentication
        const userJson = sessionStorage.getItem('census_user');
        console.log('🔒 DashboardLayout - Vérification auth, user:', userJson ? 'Trouvé' : 'Non trouvé');
        
        if (!userJson) {
            console.log('❌ Pas d\'utilisateur - Redirection vers /login');
            router.replace('/login');
            return;
        }

        try {
            const userData = JSON.parse(userJson);
            console.log('✅ Utilisateur chargé:', userData.email);
            setUser(userData);
        } catch (error) {
            console.error('💥 Erreur parsing user data:', error);
            router.replace('/login');
        }
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Hamburger Menu Button */}
                <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}
