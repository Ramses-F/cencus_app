'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { createRecord } from '@/lib/api';
import { 
    Save, Trash2, Home, User, Users, FileText, 
    CheckCircle, XCircle, AlertCircle, Info 
} from 'lucide-react';

interface FormData {
    lotNumber: string;
    familyName: string;
    responsibleName: string;
    contact: string;
    inhabitants: string;
    children: string;
    notes: string;
}

export default function AddFormPage() {
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ type: 'info', title: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        lotNumber: '',
        familyName: '',
        responsibleName: '',
        contact: '',
        inhabitants: '',
        children: '',
        notes: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const requiredFields = ['lotNumber', 'familyName', 'responsibleName', 'contact', 'inhabitants', 'children'];

    useEffect(() => {
        const draft = localStorage.getItem('census_form_draft');
        if (draft) {
            try {
                setFormData(JSON.parse(draft));
                displayToast('info', 'Draft Loaded', 'Your previous draft has been restored.');
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        }
    }, []);

    useEffect(() => {
        let filledCount = 0;
        requiredFields.forEach(field => {
            if (formData[field as keyof FormData]?.trim()) filledCount++;
        });
        setProgress((filledCount / requiredFields.length) * 100);

        const timer = setTimeout(() => {
            if (Object.values(formData).some(v => v !== '')) {
                localStorage.setItem('census_form_draft', JSON.stringify(formData));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        validateField(id, value);
        if (id === 'notes') setCharCount(Math.min(value.length, 500));
    };

    const validateField = (fieldId: string, value: string) => {
        let errorMessage = '';
        const trimmedValue = value.trim();

        if (requiredFields.includes(fieldId) && !trimmedValue) {
            errorMessage = 'Ce champ est requis';
        } else if (trimmedValue) {
            switch (fieldId) {
                case 'lotNumber':
                    if (trimmedValue.length < 1) {
                        errorMessage = 'Numéro de lot requis';
                    }
                    break;
                case 'contact':
                    if (trimmedValue.length < 8) {
                        errorMessage = 'Numéro de contact valide requis';
                    }
                    break;
                case 'inhabitants':
                    const inh = parseInt(trimmedValue);
                    if (isNaN(inh) || inh < 1) {
                        errorMessage = 'Doit être au moins 1';
                    }
                    break;
                case 'children':
                    const ch = parseInt(trimmedValue);
                    if (isNaN(ch) || ch < 0) {
                        errorMessage = 'Doit être 0 ou plus';
                    }
                    break;
            }
        }

        setErrors(prev => ({ ...prev, [fieldId]: errorMessage }));
        return errorMessage === '';
    };

    const validateForm = () => {
        let isValid = true;
        requiredFields.forEach(field => {
            if (!validateField(field, formData[field as keyof FormData])) {
                isValid = false;
            }
        });
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            displayToast('error', 'Erreur de Validation', 'Veuillez corriger les erreurs avant de soumettre.');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📝 Soumission du formulaire...', formData);
            
            // Préparer les données pour l'API
            const recordData = {
                lotNumber: formData.lotNumber,
                familyName: formData.familyName,
                responsibleName: formData.responsibleName,
                contact: formData.contact,
                inhabitants: parseInt(formData.inhabitants),
                children: parseInt(formData.children),
                notes: formData.notes || ''
            };

            console.log('🔄 Appel API createRecord...', recordData);
            const response = await createRecord(recordData);
            console.log('✅ Réponse API:', response);

            if (response.success) {
                localStorage.removeItem('census_form_draft');
                displayToast('success', 'Succès !', 'L\'enregistrement a été créé avec succès.');
                
                // Redirection après 2 secondes
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                throw new Error(response.message || 'Erreur lors de la création');
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la soumission:', error);
            
            // Gestion spécifique des erreurs de doublon
            const errorMessage = error.message || 'Échec de la soumission des données.';
            
            if (errorMessage.includes('existe déjà')) {
                displayToast('warning', 'Numéro de lot existant', 
                    `${errorMessage} Veuillez utiliser un autre numéro de lot ou vérifier les enregistrements existants.`);
                // Mettre en évidence le champ lotNumber
                setErrors(prev => ({ ...prev, lotNumber: 'Ce numéro de lot est déjà utilisé' }));
            } else {
                displayToast('error', 'Erreur', errorMessage);
            }
            
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications non sauvegardées seront perdues.')) {
            router.push('/dashboard');
        }
    };

    const saveDraft = () => {
        localStorage.setItem('census_form_draft', JSON.stringify(formData));
        displayToast('success', 'Brouillon Sauvegardé', 'Votre formulaire a été sauvegardé comme brouillon.');
    };

    const clearForm = () => {
        if (confirm('Êtes-vous sûr de vouloir effacer tous les champs ?')) {
            setFormData({
                lotNumber: '',
                familyName: '',
                responsibleName: '',
                contact: '',
                inhabitants: '',
                children: '',
                notes: ''
            });
            setErrors({});
            setCharCount(0);
            localStorage.removeItem('census_form_draft');
            displayToast('info', 'Formulaire Effacé', 'Tous les champs ont été effacés.');
        }
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

    const toastConfig = getToastConfig(toastData.type);
    const ToastIcon = toastConfig.icon;
    const filledCount = requiredFields.filter(field => formData[field as keyof FormData]?.trim()).length;

    return (
        <DashboardLayout>
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ajouter un Enregistrement</h2>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Remplissez le formulaire d'information</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={saveDraft} className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:block" title="Sauvegarder le brouillon">
                            <Save className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={clearForm} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Effacer le formulaire">
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Progression du Formulaire</span>
                        <span className="text-xs sm:text-sm text-gray-500">{filledCount} / {requiredFields.length} champs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Home className="w-5 h-5 text-blue-600" />Informations du Lot
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="lotNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Numéro de Lot <span className="text-red-500">*</span></label>
                                <input type="text" id="lotNumber" value={formData.lotNumber} onChange={handleInputChange} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.lotNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ex: A123" />
                                {errors.lotNumber && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.lotNumber}</p>}
                            </div>
                            <div>
                                <label htmlFor="familyName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nom de Famille <span className="text-red-500">*</span></label>
                                <input type="text" id="familyName" value={formData.familyName} onChange={handleInputChange} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.familyName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Entrez le nom de famille" />
                                {errors.familyName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.familyName}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />Informations du Responsable
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="responsibleName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nom du Responsable <span className="text-red-500">*</span></label>
                                <input type="text" id="responsibleName" value={formData.responsibleName} onChange={handleInputChange} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.responsibleName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nom complet du responsable" />
                                {errors.responsibleName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.responsibleName}</p>}
                            </div>
                            <div>
                                <label htmlFor="contact" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contact <span className="text-red-500">*</span></label>
                                <input type="tel" id="contact" value={formData.contact} onChange={handleInputChange} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.contact ? 'border-red-500' : 'border-gray-300'}`} placeholder="+225 XX XX XX XX XX" />
                                {errors.contact && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contact}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />Composition du Ménage
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="inhabitants" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nombre d'Habitants <span className="text-red-500">*</span></label>
                                <input type="number" id="inhabitants" value={formData.inhabitants} onChange={handleInputChange} min="1" className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.inhabitants ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nombre total de personnes" />
                                {errors.inhabitants && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.inhabitants}</p>}
                            </div>
                            <div>
                                <label htmlFor="children" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nombre d'Enfants <span className="text-red-500">*</span></label>
                                <input type="number" id="children" value={formData.children} onChange={handleInputChange} min="0" className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.children ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nombre d'enfants" />
                                {errors.children && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.children}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />Notes Additionnelles
                        </h3>
                        <div>
                            <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Notes (Optionnel)</label>
                            <textarea id="notes" value={formData.notes} onChange={handleInputChange} maxLength={500} rows={4} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none" placeholder="Ajoutez des informations supplémentaires..."></textarea>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-right">{charCount} / 500 caractères</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button type="button" onClick={handleCancel} className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base">Annuler</button>
                            <button type="button" onClick={saveDraft} className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition text-sm sm:text-base">Sauvegarder</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm sm:text-base">
                                {isSubmitting ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Envoi...</span></>) : (<><CheckCircle className="w-5 h-5" /><span>Valider & Envoyer</span></>)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

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
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
