'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { getStats, getAllRecords } from '@/lib/api';
import { 
    Users, Home, Star, Calendar, BarChart3, PieChart, TrendingUp, 
    Database, Percent, RefreshCw, Download, CheckCircle, XCircle, 
    AlertCircle, Info, X 
} from 'lucide-react';

interface AnalyticsData {
    totalRecords: number;
    totalHouseholds: number;
    totalInhabitants: number;
    totalYouth: number;
    averageAge: number;
    averageHouseholdSize: number;
    maleCount: number;
    femaleCount: number;
    regionDistribution: { [key: string]: number };
    ageGroups: { label: string; count: number; percentage: number }[];
    monthlyGrowth: { month: string; records: number }[];
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ type: 'info', title: '', message: '' });
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalRecords: 0,
        totalHouseholds: 0,
        totalInhabitants: 0,
        totalYouth: 0,
        averageAge: 0,
        averageHouseholdSize: 0,
        maleCount: 0,
        femaleCount: 0,
        regionDistribution: {},
        ageGroups: [],
        monthlyGrowth: []
    });
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [selectedMetric, setSelectedMetric] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            console.log('📊 Chargement des analyses...');
            
            // Charger les statistiques
            const statsResponse = await getStats();
            console.log('✅ Stats reçues:', statsResponse);
            
            // Charger tous les enregistrements pour l'analyse détaillée
            const recordsResponse = await getAllRecords({ page: 1, limit: 1000 });
            console.log('✅ Enregistrements reçus:', recordsResponse);
            
            if (statsResponse.success && statsResponse.data) {
                const stats = statsResponse.data;
                const records = recordsResponse.data || [];
                
                // Calcul des moyennes
                const averageHouseholdSize = records.length > 0 
                    ? records.reduce((sum: number, r: any) => sum + (r.inhabitants || 0), 0) / records.length 
                    : 0;
                
                // Calcul des groupes d'âge basés sur les enfants
                const totalPeople = stats.totalInhabitants || 0;
                const totalKids = stats.totalChildren || 0;
                const totalAdults = totalPeople - totalKids;
                
                const ageGroups = [
                    { label: '0-17', count: totalKids, percentage: totalPeople > 0 ? (totalKids / totalPeople) * 100 : 0 },
                    { label: '18+', count: totalAdults, percentage: totalPeople > 0 ? (totalAdults / totalPeople) * 100 : 0 }
                ];
                
                // Croissance mensuelle (simulée pour le moment)
                const monthlyGrowth = [
                    { month: 'Jan', records: Math.floor(stats.totalRecords * 0.15) },
                    { month: 'Fév', records: Math.floor(stats.totalRecords * 0.12) },
                    { month: 'Mar', records: Math.floor(stats.totalRecords * 0.18) },
                    { month: 'Avr', records: Math.floor(stats.totalRecords * 0.14) },
                    { month: 'Mai', records: Math.floor(stats.totalRecords * 0.21) },
                    { month: 'Juin', records: Math.floor(stats.totalRecords * 0.20) }
                ];
                
                setAnalytics({
                    totalRecords: stats.totalRecords || 0,
                    totalHouseholds: stats.totalRecords || 0,
                    totalInhabitants: stats.totalInhabitants || 0,
                    totalYouth: stats.totalChildren || 0,
                    averageAge: 28.5, // À calculer avec plus de données
                    averageHouseholdSize: parseFloat(averageHouseholdSize.toFixed(1)),
                    maleCount: Math.floor((stats.totalInhabitants || 0) * 0.51), // Estimation
                    femaleCount: Math.floor((stats.totalInhabitants || 0) * 0.49), // Estimation
                    regionDistribution: {},
                    ageGroups,
                    monthlyGrowth
                });
                
                displayToast('success', 'Analyses Chargées', 'Les données d\'analyse sont à jour');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des analyses:', error);
            displayToast('error', 'Erreur', 'Impossible de charger les analyses');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            await loadAnalytics();
            displayToast('success', 'Actualisé', 'Les données d\'analyse ont été mises à jour');
        } catch (error) {
            console.error('❌ Erreur lors de l\'actualisation:', error);
            displayToast('error', 'Erreur', 'Échec de l\'actualisation des données');
        }
    };

    const handleExport = () => {
        const data = JSON.stringify(analytics, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `census-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        displayToast('success', 'Exporté', 'Les données d\'analyse ont été exportées avec succès');
    };

    const displayToast = (type: string, title: string, message: string) => {
        setToastData({ type, title, message });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const getToastConfig = (type: string) => {
        const configs = {
            success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
            warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
        };
        return configs[type as keyof typeof configs] || configs.info;
    };

    const formatNumber = (num: number) => num.toLocaleString('en-US');

    const toastConfig = getToastConfig(toastData.type);
    const ToastIcon = toastConfig.icon;
    const genderRatio = analytics.totalRecords > 0 
        ? ((analytics.maleCount / analytics.totalRecords) * 100).toFixed(1)
        : 0;

    return (
        <DashboardLayout>
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tableau de Bord d'Analyse</h2>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Analyse complète des données de recensement et informations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        <button onClick={handleExport} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                            <Download className="w-4 h-4" />
                            <span>Exporter</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 sm:px-6 lg:px-8 pb-4 flex gap-3 overflow-x-auto">
                    <button onClick={() => setSelectedPeriod('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedPeriod === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tout le Temps</button>
                    <button onClick={() => setSelectedPeriod('month')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Ce Mois</button>
                    <button onClick={() => setSelectedPeriod('quarter')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedPeriod === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Ce Trimestre</button>
                    <button onClick={() => setSelectedPeriod('year')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cette Année</button>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Chargement des analyses...</p>
                        </div>
                    </div>
                ) : (
                    <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            <span className="text-xs sm:text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">Total</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{formatNumber(analytics.totalRecords)}</p>
                        <p className="text-xs sm:text-sm opacity-90">Enregistrements</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Home className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            <span className="text-xs sm:text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">Moy</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{analytics.averageHouseholdSize}</p>
                        <p className="text-xs sm:text-sm opacity-90">Taille Ménage</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Star className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            <span className="text-xs sm:text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">{((analytics.totalYouth / analytics.totalInhabitants) * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{formatNumber(analytics.totalYouth)}</p>
                        <p className="text-xs sm:text-sm opacity-90">Jeunes Musulmans</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            <span className="text-xs sm:text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">Ans</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{analytics.averageAge}</p>
                        <p className="text-xs sm:text-sm opacity-90">Âge Moyen</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Age Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Distribution par Âge
                        </h3>
                        <div className="space-y-4">
                            {analytics.ageGroups.map((group, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{group.label} ans</span>
                                        <span className="text-sm text-gray-500">{group.count} ({group.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${group.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gender Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            Distribution par Sexe
                        </h3>
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="flex items-center justify-center mb-8">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20"></circle>
                                            <circle 
                                                cx="50" 
                                                cy="50" 
                                                r="40" 
                                                fill="none" 
                                                stroke="#3b82f6" 
                                                strokeWidth="20"
                                                strokeDasharray={`${(analytics.maleCount / analytics.totalRecords) * 251.2} 251.2`}
                                                className="transition-all duration-500"
                                            ></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-gray-900">{genderRatio}%</p>
                                                <p className="text-xs text-gray-500">Hommes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Hommes</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(analytics.maleCount)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{((analytics.maleCount / analytics.totalRecords) * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Femmes</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(analytics.femaleCount)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{((analytics.femaleCount / analytics.totalRecords) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Trend */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Tendance de Croissance Mensuelle
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {analytics.monthlyGrowth.map((data, idx) => {
                            const maxValue = Math.max(...analytics.monthlyGrowth.map(d => d.records));
                            const height = (data.records / maxValue) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs font-medium text-gray-600 mb-1">{data.records}</span>
                                        <div 
                                            className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-indigo-600"
                                            style={{ height: `${height}%`, minHeight: '20px' }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">{data.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500 mb-1">Total des Habitants</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(analytics.totalInhabitants)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500 mb-1">Total des Ménages</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(analytics.totalHouseholds)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Percent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500 mb-1">Ratio de Jeunesse</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{((analytics.totalYouth / analytics.totalInhabitants) * 100).toFixed(1)}%</p>
                            </div>
                        </div>
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
                        <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
