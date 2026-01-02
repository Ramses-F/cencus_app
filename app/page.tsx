'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Éviter les exécutions multiples
    if (!isChecking) return;
    
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log('🏠 Page d\'accueil - Utilisateur authentifié:', authenticated);
      
      if (authenticated) {
        console.log('✅ Redirection vers /dashboard');
        router.replace('/dashboard');
      } else {
        console.log('🔐 Redirection vers /login');
        router.replace('/login');
      }
    };

    // Petit délai pour éviter les problèmes de timing
    const timer = setTimeout(checkAuth, 100);
    
    return () => {
      clearTimeout(timer);
      setIsChecking(false);
    };
  }, [router, isChecking]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Chargement...</p>
      </div>
    </div>
  );
}
