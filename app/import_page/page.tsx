'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { importRecords } from '@/lib/api';
import { UploadCloud, FileText, RefreshCw, Upload, Loader, CheckCircle, AlertCircle, Eye, Info, X, HelpCircle, Check, FileSpreadsheet, HardDrive, Sheet } from 'lucide-react';

interface ImportRecord {
    lotNumber: string;
    familyName: string;
    responsibleName: string;
    contact: string;
    inhabitants: number;
    children: number;
    notes?: string;
}

export default function ImportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processedRecords, setProcessedRecords] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ type: 'info', title: '', message: '' });
    const [uploadState, setUploadState] = useState<'idle' | 'preview' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [successStats, setSuccessStats] = useState({ total: 0, valid: 0, invalid: 0 });

    useEffect(() => {
        displayToast('info', 'Import Prêt', 'Vous pouvez maintenant télécharger des fichiers de données');
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileSelect(files[0]);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleFileSelect(files[0]);
    };

    const handleFileSelect = (file: File) => {
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const validExtensions = ['.csv', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            displayToast('error', 'Fichier Invalide', 'Veuillez télécharger un fichier CSV ou Excel (.csv, .xls, .xlsx)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            displayToast('error', 'Fichier Trop Grand', 'La taille du fichier doit être inférieure à 10Mo');
            return;
        }
        setCurrentFile(file);
        setUploadState('preview');
        displayToast('success', 'Fichier Sélectionné', `${file.name} est prêt à être importé`);
    };

    const processCSV = (text: string): ImportRecord[] => {
        const lines = text.split('\n').filter(line => line.trim());
        const records: ImportRecord[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            if (values.length >= 6) {
                records.push({
                    lotNumber: values[0] || '',
                    familyName: values[1] || '',
                    responsibleName: values[2] || '',
                    contact: values[3] || '',
                    inhabitants: parseInt(values[4]) || 0,
                    children: parseInt(values[5]) || 0,
                    notes: values[6] || ''
                });
            }
        }
        return records;
    };

    const validateRecord = (record: ImportRecord): boolean => {
        if (!record.lotNumber || !record.familyName || !record.responsibleName) return false;
        if (!record.contact || record.contact.length < 8) return false;
        if (isNaN(record.inhabitants) || record.inhabitants < 1) return false;
        if (isNaN(record.children) || record.children < 0) return false;
        return true;
    };

    const handleImport = async () => {
        if (!currentFile) return;
        
        setIsProcessing(true);
        setUploadState('processing');
        setUploadProgress(0);
        
        try {
            console.log('📂 Début de l\'import du fichier:', currentFile.name);
            const text = await currentFile.text();
            const records = processCSV(text);
            setTotalRecords(records.length);
            
            console.log(`📊 ${records.length} enregistrements trouvés dans le fichier`);
            
            // Filtrer les enregistrements valides
            const validRecords = records.filter(validateRecord);
            const invalidCount = records.length - validRecords.length;
            
            console.log(`✅ ${validRecords.length} enregistrements valides, ❌ ${invalidCount} invalides`);
            
            if (validRecords.length === 0) {
                throw new Error('Aucun enregistrement valide trouvé dans le fichier');
            }
            
            // Appel de l'API d'import
            console.log('🔄 Appel API importRecords...');
            const response = await importRecords(validRecords);
            console.log('✅ Réponse API:', response);
            
            if (response.success) {
                setSuccessStats({ 
                    total: records.length, 
                    valid: response.data?.imported || validRecords.length, 
                    invalid: invalidCount 
                });
                setUploadProgress(100);
                setProcessedRecords(records.length);
                setUploadState('success');
                displayToast('success', 'Import Terminé', 
                    `${response.data?.imported || validRecords.length} enregistrements importés avec succès`);
            } else {
                throw new Error(response.message || 'Erreur lors de l\'import');
            }
        } catch (error: any) {
            console.error('❌ Erreur d\'import:', error);
            setErrorMessage(error.message || 'Échec du traitement du fichier. Veuillez vérifier le format et réessayer.');
            setUploadState('error');
            displayToast('error', 'Échec de l\'Import', error.message || 'Une erreur s\'est produite lors du traitement de votre fichier');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setCurrentFile(null);
        setUploadState('idle');
        setUploadProgress(0);
        setProcessedRecords(0);
        setTotalRecords(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleNewImport = () => {
        handleCancel();
        displayToast('info', 'Ready for Import', 'Select a new file to import');
    };

    const handleViewRecords = () => {
        router.push('/dashboard');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

    const toastConfig = getToastConfig(toastData.type);
    const ToastIcon = toastConfig.icon;

    return (
        <DashboardLayout>
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div><h2 className="text-lg sm:text-xl font-bold text-gray-900">Importer des Données</h2><p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Téléchargez des fichiers CSV ou Excel pour importer des enregistrements en masse</p></div>
                    <button onClick={handleNewImport} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Nouvel Import"><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /></button>
                </div>
            </header>
            <div className="p-4 sm:p-6 lg:p-8"><div className="max-w-4xl mx-auto">
                {uploadState === 'idle' && (<div className={`bg-white rounded-xl shadow-sm p-8 sm:p-12 border-2 border-dashed transition-all ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}><div className="text-center"><div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div><h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Déposez votre fichier ici</h3><p className="text-sm text-gray-500 mb-6">ou cliquez pour parcourir depuis votre ordinateur</p><button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition">Sélectionner un Fichier</button><input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleFileInputChange} className="hidden" /><div className="mt-8 pt-8 border-t border-gray-200"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"><div className="flex items-start gap-3"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-green-600" /></div><div><p className="text-sm font-medium text-gray-900">Fichiers CSV</p><p className="text-xs text-gray-500">Valeurs séparées par des virgules</p></div></div><div className="flex items-start gap-3"><div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Sheet className="w-4 h-4 text-blue-600" /></div><div><p className="text-sm font-medium text-gray-900">Fichiers Excel</p><p className="text-xs text-gray-500">Format .xls, .xlsx</p></div></div><div className="flex items-start gap-3"><div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0"><HardDrive className="w-4 h-4 text-purple-600" /></div><div><p className="text-sm font-medium text-gray-900">Taille Max</p><p className="text-xs text-gray-500">Jusqu'à 10Mo</p></div></div></div></div></div></div>)}
                {uploadState === 'preview' && currentFile && (<div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100"><div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0"><FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></div><div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{currentFile.name}</h3><p className="text-sm text-gray-500">{formatFileSize(currentFile.size)} • {currentFile.type || 'Type inconnu'}</p></div></div><div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"><div className="flex items-start gap-3"><Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-blue-900 mb-1">Format Attendu</p><p className="text-xs text-blue-700">Votre fichier doit contenir les colonnes : Numéro de Lot, Nom de Famille, Nom du Responsable, Contact, Nombre d'Habitants, Nombre d'Enfants, Notes (optionnel)</p></div></div></div><div className="flex flex-col sm:flex-row gap-3"><button onClick={handleCancel} className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">Annuler</button><button onClick={handleImport} disabled={isProcessing} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"><Upload className="w-5 h-5" /><span>Démarrer l'Import</span></button></div></div>)}
                {uploadState === 'processing' && (<div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100"><div className="text-center mb-8"><div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Loader className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" /></div><h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Traitement de l'Import...</h3><p className="text-sm text-gray-500">Veuillez patienter pendant que nous importons vos enregistrements</p></div><div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Progression</span><span className="text-sm text-gray-500">{processedRecords} / {totalRecords} enregistrements</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div></div><p className="text-center text-lg font-bold text-blue-600 mt-2">{Math.round(uploadProgress)}%</p></div></div>)}
                {uploadState === 'success' && (<div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100"><div className="text-center mb-8"><div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div><h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Import Réussi !</h3><p className="text-sm text-gray-500">Vos données ont été importées avec succès</p></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Total</span><FileText className="w-4 h-4 text-blue-600" /></div><p className="text-2xl font-bold text-gray-900">{successStats.total}</p></div><div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Valides</span><Check className="w-4 h-4 text-green-600" /></div><p className="text-2xl font-bold text-green-600">{successStats.valid}</p></div><div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-100"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Invalides</span><X className="w-4 h-4 text-red-600" /></div><p className="text-2xl font-bold text-red-600">{successStats.invalid}</p></div></div><div className="flex flex-col sm:flex-row gap-3"><button onClick={handleNewImport} className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">Importer un Autre Fichier</button><button onClick={handleViewRecords} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"><Eye className="w-5 h-5" /><span>Voir les Enregistrements</span></button></div></div>)}
                {uploadState === 'error' && (<div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100"><div className="text-center mb-8"><div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div><h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Échec de l'Import</h3><p className="text-sm text-gray-500 mb-4">{errorMessage}</p></div><div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><div className="flex items-start gap-3"><Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-red-900 mb-1">Problèmes Courants</p><ul className="text-xs text-red-700 space-y-1 list-disc list-inside"><li>Vérifiez que le format du fichier correspond à la structure attendue</li><li>Assurez-vous que tous les champs requis sont présents</li><li>Vérifiez que les types de données sont corrects (nombres, texte)</li><li>Supprimez les caractères spéciaux ou le formatage</li></ul></div></div></div><div className="flex flex-col sm:flex-row gap-3"><button onClick={handleCancel} className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">Annuler</button><button onClick={handleNewImport} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5" /><span>Réessayer</span></button></div></div>)}
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"><h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600" />Besoin d'Aide ?</h4><div className="space-y-3 text-sm text-gray-700"><p><strong>Format de Fichier :</strong> Votre fichier CSV doit avoir une ligne d'en-tête avec les noms de colonnes, suivie des lignes de données.</p><p><strong>Colonnes Requises :</strong> lotNumber, familyName, responsibleName, contact, inhabitants, children</p><p><strong>Exemple de Ligne :</strong> <code className="bg-white px-2 py-1 rounded text-xs">LOT001,Dupont,Jean Dupont,0612345678,4,2,Notes optionnelles</code></p></div></div>
            </div></div>
            {showToast && (<div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm sm:max-w-sm mx-auto sm:mx-0 animate-slide-up z-50"><div className="flex items-start gap-3"><div className={`p-2 ${toastConfig.bg} rounded-lg flex-shrink-0`}><ToastIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${toastConfig.color}`} /></div><div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-gray-900">{toastData.title}</h4><p className="text-xs text-gray-600 mt-1 break-words">{toastData.message}</p></div><button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-4 h-4" /></button></div></div>)}
        </DashboardLayout>
    );
}
