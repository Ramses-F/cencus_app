'use client';

/**
 * Dashboard Application - Next.js Version
 * Census Data Platform Dashboard System
 * @version 3.0.0
 */

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getStats, getAllRecords } from '@/lib/api';
import { 
    Sun, Moon, Sunrise, RefreshCw, Search, Bell, Home, Users, 
    Star, MapPin, TrendingUp, Zap, Plus, Download, Activity, 
    Inbox, ChevronRight, CheckCircle, Info, AlertCircle, X 
} from 'lucide-react';

// Helper pour mapper les noms d'icônes aux composants
const iconMap: { [key: string]: any } = {
    'sun': Sun,
    'sunrise': Sunrise,
    'moon': Moon,
    'home': Home,
    'users': Users,
    'star': Star,
    'map-pin': MapPin,
    'trending-up': TrendingUp,
    'plus': Plus,
    'download': Download,
    'search': Search,
    'inbox': Inbox,
    'activity': Activity,
};

const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Home;
};

interface Activity {
    id: string;
    type: string;
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    timestamp: string;
    timeAgo: string;
}

interface Stats {
    households: number;
    householdsChange: number;
    inhabitants: number;
    inhabitantsChange: number;
    youth: number;
    youthChange: number;
    regions: number;
}

export default function DashboardPage() {
    const [greeting, setGreeting] = useState('Bonjour');
    const [greetingIcon, setGreetingIcon] = useState<'sun' | 'sunrise' | 'moon'>('sun');
    const [stats, setStats] = useState<Stats>({
        households: 0,
        householdsChange: 0,
        inhabitants: 0,
        inhabitantsChange: 0,
        youth: 0,
        youthChange: 0,
        regions: 0
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({
        type: 'info',
        title: '',
        message: ''
    });
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [recentRecords, setRecentRecords] = useState<any[]>([]);

    // Charger les statistiques depuis l'API
    const loadStats = async () => {
        try {
            console.log('📊 Chargement des statistiques...');
            const response = await getStats();
            console.log('✅ Statistiques reçues:', response);
            
            if (response.success && response.data) {
                const apiStats = response.data;
                setStats({
                    households: apiStats.totalRecords || 0,
                    householdsChange: 12.5, // Calcul de tendance à implémenter plus tard
                    inhabitants: apiStats.totalInhabitants || 0,
                    inhabitantsChange: 8.3,
                    youth: apiStats.totalChildren || 0,
                    youthChange: 15.7,
                    regions: 7 // À adapter selon vos données
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des stats:', error);
            displayToast('error', 'Erreur', 'Impossible de charger les statistiques');
        }
    };

    // Charger les enregistrements récents
    const loadRecentRecords = async () => {
        try {
            console.log('📝 Chargement des enregistrements récents...');
            const response = await getAllRecords({ page: 1, limit: 5 });
            console.log('✅ Enregistrements reçus:', response);
            
            if (response.success && response.data) {
                setRecentRecords(response.data);
                
                // Convertir en activités pour l'affichage
                const newActivities = response.data.map((record: any, index: number) => {
                    const timeAgo = getTimeAgo(new Date(record.createdAt));
                    return {
                        id: record._id,
                        type: 'add',
                        icon: 'user-plus',
                        iconColor: 'green',
                        title: 'Nouvel Enregistrement',
                        description: `${record.familyName} - Lot ${record.lotNumber} - ${record.inhabitants} habitants`,
                        timestamp: record.createdAt,
                        timeAgo: timeAgo
                    };
                });
                setActivities(newActivities);
                setNotificationCount(newActivities.length);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des enregistrements:', error);
            displayToast('error', 'Erreur', 'Impossible de charger les enregistrements récents');
        } finally {
            setLoading(false);
        }
    };

    // Calculer le temps écoulé
    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'à l\'instant';
        if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    };

    useEffect(() => {
        // Setup greeting
        const hour = new Date().getHours();
        if (hour >= 12 && hour < 18) {
            setGreeting('Bon Après-midi');
            setGreetingIcon('sun');
        } else if (hour >= 18 || hour < 5) {
            setGreeting('Bonsoir');
            setGreetingIcon('moon');
        }

        // Charger les données
        loadStats();
        loadRecentRecords();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await Promise.all([loadStats(), loadRecentRecords()]);
            displayToast('success', 'Actualisé', 'Les données du tableau de bord ont été mises à jour avec succès.');
        } catch (error) {
            displayToast('error', 'Erreur', 'Échec de l\'actualisation des données.');
        }
    };

    const displayToast = (type: string, title: string, message: string) => {
        setToastData({ type, title, message });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US');
    };

    const getColorClasses = (color: string) => {
        const colorMap: { [key: string]: string } = {
            green: 'bg-green-50 text-green-600',
            blue: 'bg-blue-50 text-blue-600',
            amber: 'bg-amber-50 text-amber-600',
            red: 'bg-red-50 text-red-600'
        };
        return colorMap[color] || colorMap.blue;
    };

    const getToastConfig = (type: string) => {
        const iconMap: { [key: string]: { icon: any; color: string; bg: string } } = {
            success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
            warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
        };
        return iconMap[type] || iconMap.info;
    };

    // Get user data from sessionStorage
    const userJson = typeof window !== 'undefined' ? sessionStorage.getItem('census_user') : null;
    const user = userJson ? JSON.parse(userJson) : { name: 'User' };
    const firstName = user.name.split(' ')[0];
    const toastConfig = getToastConfig(toastData.type);
    const ToastIcon = toastConfig.icon;
    const GreetingIcon = getIconComponent(greetingIcon);

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <GreetingIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 hidden sm:block" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {greeting}, {firstName}!
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Bon retour sur votre tableau de bord</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleRefresh}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:block">
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => {
                                setNotificationCount(0);
                                displayToast('info', 'Notifications', 'Toutes les notifications ont été marquées comme lues');
                            }}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des données...</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                {!loading && (
                    <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Households */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-green-600 text-xs sm:text-sm font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                {stats.householdsChange}%
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Total des Ménages</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(stats.households)}</p>
                    </div>

                    {/* Total Inhabitants */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-green-600 text-xs sm:text-sm font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                {stats.inhabitantsChange}%
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Total des Habitants</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(stats.inhabitants)}</p>
                    </div>

                    {/* Young Muslims */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-green-600 text-xs sm:text-sm font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                {stats.youthChange}%
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Jeunes Musulmans</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(stats.youth)}</p>
                    </div>

                    {/* Covered Regions */}
                    {/* <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Régions Couvertes</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.regions}</p>
                    </div> */}
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            Actions Rapides
                        </h3>
                        <div className="space-y-3">
                            <a
                                href="/add_page"
                                className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">Ajouter un Enregistrement</p>
                                        <p className="text-xs text-gray-500 hidden sm:block">Créer une nouvelle entrée de recensement</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
                            </a>

                            <button className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">Générer un Rapport</p>
                                        <p className="text-xs text-gray-500 hidden sm:block">Exporter les données de recensement</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
                            </button>

                            <button className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">Rechercher des Enregistrements</p>
                                        <p className="text-xs text-gray-500 hidden sm:block">Trouver des entrées spécifiques</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Activité Récente
                        </h3>
                        {activities.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Aucune activité récente</p>
                                <p className="text-xs mt-1">Les nouveaux enregistrements apparaîtront ici</p>
                            </div>
                        ) : (
                        <div className="space-y-4">
                            {activities.map(activity => {
                                const ActivityIcon = getIconComponent(activity.icon);
                                return (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClasses(activity.iconColor)}`}>
                                        <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                                        <p className="text-xs text-gray-500 mt-1 break-words">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                        )}
                        {activities.length > 0 && (
                        <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                            Voir Toute l'Activité
                        </button>
                        )}
                    </div>
                </div>
                </>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm sm:max-w-sm mx-auto sm:mx-0 animate-slide-up z-50">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 ${toastConfig.bg} rounded-lg flex-shrink-0`}>
                            <ToastIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${toastConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900">{toastData.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 break-words">{toastData.message}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
