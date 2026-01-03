'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { 
    Database, Search, Edit, Trash2, X, Save, Users, User, 
    Phone, Home, Baby, FileText, AlertCircle, CheckCircle, Info,
    Filter, RefreshCw, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

interface CensusRecord {
    _id: string;
    lotNumber: string;
    familyName: string;
    responsibleName: string;
    contact: string;
    inhabitants: number;
    children: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export default function RecordsPage() {
    const router = useRouter();
    const [records, setRecords] = useState<CensusRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<CensusRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRecord, setEditingRecord] = useState<CensusRecord | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ type: 'info', title: '', message: '' });
    const [formData, setFormData] = useState({
        lotNumber: '',
        familyName: '',
        responsibleName: '',
        contact: '',
        inhabitants: '',
        children: '',
        notes: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [searchTerm, records]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/census`);
            const data = await response.json();
            
            if (data.success) {
                setRecords(data.data || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            displayToast('error', 'Erreur', 'Impossible de charger les enregistrements');
        } finally {
            setIsLoading(false);
        }
    };

    const filterRecords = () => {
        if (!searchTerm) {
            setFilteredRecords(records);
            return;
        }

        const filtered = records.filter(record => 
            record.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.contact.includes(searchTerm)
        );
        setFilteredRecords(filtered);
        setCurrentPage(1);
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
            error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
        };
        return configs[type as keyof typeof configs] || configs.info;
    };

    const handleEdit = (record: CensusRecord) => {
        setEditingRecord(record);
        setFormData({
            lotNumber: record.lotNumber,
            familyName: record.familyName,
            responsibleName: record.responsibleName,
            contact: record.contact,
            inhabitants: record.inhabitants.toString(),
            children: record.children.toString(),
            notes: record.notes || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
        setFormData({
            lotNumber: '',
            familyName: '',
            responsibleName: '',
            contact: '',
            inhabitants: '',
            children: '',
            notes: ''
        });
    };

    const handleUpdateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingRecord) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/census/${editingRecord._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lotNumber: formData.lotNumber,
                    familyName: formData.familyName,
                    responsibleName: formData.responsibleName,
                    contact: formData.contact,
                    inhabitants: parseInt(formData.inhabitants),
                    children: parseInt(formData.children),
                    notes: formData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                displayToast('success', 'Mis à jour', 'L\'enregistrement a été modifié avec succès');
                fetchRecords();
                handleCancelEdit();
            } else {
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error: any) {
            console.error('Erreur:', error);
            displayToast('error', 'Échec', error.message || 'Impossible de mettre à jour l\'enregistrement');
        }
    };

    const handleDeleteRecord = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/census/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                displayToast('success', 'Supprimé', 'L\'enregistrement a été supprimé avec succès');
                fetchRecords();
                setShowDeleteConfirm(null);
            } else {
                throw new Error(data.message || 'Erreur lors de la suppression');
            }
        } catch (error: any) {
            console.error('Erreur:', error);
            displayToast('error', 'Échec', error.message || 'Impossible de supprimer l\'enregistrement');
        }
    };

    const toastConfig = getToastConfig(toastData.type);
    const ToastIcon = toastConfig.icon;

    // Pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gestion des Enregistrements</h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {filteredRecords.length} enregistrement(s) trouvé(s)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchRecords}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Actualiser</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher par numéro de lot, nom, responsable ou contact..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Records Table */}
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Chargement des enregistrements...</p>
                        </div>
                    ) : currentRecords.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun enregistrement trouvé</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter des enregistrements'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lot</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Famille</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Responsable</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Habitants</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Enfants</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {currentRecords.map((record) => (
                                                <tr key={record._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{record.lotNumber}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{record.familyName}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{record.responsibleName}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{record.contact}</td>
                                                    <td className="px-4 py-4 text-sm text-center text-gray-700">{record.inhabitants}</td>
                                                    <td className="px-4 py-4 text-sm text-center text-gray-700">{record.children}</td>
                                                    <td className="px-4 py-4 text-sm">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(record._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4">
                                {currentRecords.map((record) => (
                                    <div key={record._id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <Home className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="font-semibold text-gray-900">{record.lotNumber}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(record)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(record._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{record.familyName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{record.responsibleName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{record.contact}</span>
                                            </div>
                                            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{record.inhabitants}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Baby className="w-4 h-4" />
                                                    <span className="font-medium">{record.children}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} sur {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Modifier l'enregistrement</h3>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateRecord} className="p-6 space-y-6">
                            {/* Lot Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Home className="w-4 h-4 inline mr-1" />
                                    Numéro de Lot
                                </label>
                                <input
                                    type="text"
                                    value={formData.lotNumber}
                                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Family Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Nom de Famille
                                </label>
                                <input
                                    type="text"
                                    value={formData.familyName}
                                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Responsible Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Nom du Responsable
                                </label>
                                <input
                                    type="text"
                                    value={formData.responsibleName}
                                    onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Contact */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Contact
                                </label>
                                <input
                                    type="tel"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Inhabitants and Children */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Habitants
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.inhabitants}
                                        onChange={(e) => setFormData({ ...formData, inhabitants: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Baby className="w-4 h-4 inline mr-1" />
                                        Enfants
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.children}
                                        onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    Notes (optionnel)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>Enregistrer</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-50 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDeleteRecord(showDeleteConfirm)}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>Supprimer</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
