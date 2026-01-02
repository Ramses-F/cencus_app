'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { Settings, Mail, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [emailData, setEmailData] = useState({
        currentEmail: '',
        newEmail: '',
        password: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
        emailPassword: false
    });
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ type: 'info', title: '', message: '' });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const userJson = sessionStorage.getItem('census_user');
        if (!userJson) {
            router.push('/login');
            return;
        }
        
        const userData = JSON.parse(userJson);
        setUser(userData);
        setEmailData(prev => ({ ...prev, currentEmail: userData.email }));
    }, [router]);

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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        // Validation
        if (!emailData.newEmail || !emailData.password) {
            setErrors({ email: 'Tous les champs sont requis' });
            displayToast('error', 'Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (!validateEmail(emailData.newEmail)) {
            setErrors({ email: 'Email invalide' });
            displayToast('error', 'Erreur', 'Veuillez entrer un email valide');
            return;
        }

        if (emailData.newEmail === emailData.currentEmail) {
            setErrors({ email: 'Le nouvel email est identique à l\'actuel' });
            displayToast('warning', 'Attention', 'Veuillez entrer un email différent');
            return;
        }

        setIsSubmittingEmail(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    newEmail: emailData.newEmail,
                    password: emailData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Mettre à jour les données de session
                const updatedUser = { ...user, email: emailData.newEmail };
                sessionStorage.setItem('census_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEmailData({ currentEmail: emailData.newEmail, newEmail: '', password: '' });
                
                displayToast('success', 'Email mis à jour', 'Votre adresse email a été modifiée avec succès');
            } else {
                throw new Error(data.message || 'Erreur lors de la mise à jour de l\'email');
            }
        } catch (error: any) {
            console.error('Erreur:', error);
            displayToast('error', 'Échec', error.message || 'Impossible de mettre à jour l\'email');
        } finally {
            setIsSubmittingEmail(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setErrors({ password: 'Tous les champs sont requis' });
            displayToast('error', 'Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setErrors({ password: 'Le mot de passe doit contenir au moins 6 caractères' });
            displayToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrors({ password: 'Les mots de passe ne correspondent pas' });
            displayToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (passwordData.newPassword === passwordData.currentPassword) {
            setErrors({ password: 'Le nouveau mot de passe doit être différent' });
            displayToast('warning', 'Attention', 'Veuillez choisir un mot de passe différent');
            return;
        }

        setIsSubmittingPassword(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                displayToast('success', 'Mot de passe mis à jour', 'Votre mot de passe a été modifié avec succès');
            } else {
                throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe');
            }
        } catch (error: any) {
            console.error('Erreur:', error);
            displayToast('error', 'Échec', error.message || 'Impossible de mettre à jour le mot de passe');
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Paramètres du Compte</h2>
                            <p className="text-xs sm:text-sm text-gray-500">Gérez vos informations de connexion</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Informations actuelles */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">Compte actuel</h3>
                                <p className="text-sm text-blue-700">
                                    <strong>Email :</strong> {user.email}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    Dernière connexion : {new Date().toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de changement d'email */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Changer l'adresse email</h3>
                        </div>

                        <form onSubmit={handleEmailChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email actuel
                                </label>
                                <input
                                    type="email"
                                    value={emailData.currentEmail}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nouvel email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={emailData.newEmail}
                                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="nouveau@example.com"
                                    disabled={isSubmittingEmail}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe actuel <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.emailPassword ? 'text' : 'password'}
                                        value={emailData.password}
                                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isSubmittingEmail}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, emailPassword: !showPasswords.emailPassword })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.emailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingEmail}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {isSubmittingEmail ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Mise à jour...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Mettre à jour l'email</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Formulaire de changement de mot de passe */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe actuel <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isSubmittingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nouveau mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isSubmittingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isSubmittingPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingPassword}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-75 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {isSubmittingPassword ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Mise à jour...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Mettre à jour le mot de passe</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Conseils de sécurité */}
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-amber-900 mb-2">Conseils de sécurité</h3>
                                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                                    <li>Utilisez un mot de passe fort avec lettres, chiffres et symboles</li>
                                    <li>Ne partagez jamais vos identifiants avec d'autres personnes</li>
                                    <li>Changez régulièrement votre mot de passe</li>
                                    <li>N'utilisez pas le même mot de passe pour plusieurs services</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
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
                            <AlertCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
