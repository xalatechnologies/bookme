"use client";

import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useFacilityStore } from "@/stores/facilityStore";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Check,
  Clock,
  Smartphone,
  Monitor,
  Bell,
  BellOff,
  Download,
  UserCog,
  Key,
  History,
  ShieldCheck,
  Settings,
  LogOut,
  Upload,
  CheckCircle,
  XCircle,
  Building2,
  ChevronDown
} from "lucide-react";

const UserProfile = (): JSX.Element => {
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading } = useUserProfile();
  const { favorites } = useFavoritesStore();
  const { getFacilityById } = useFacilityStore();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = useRef<boolean>(false);
  
  // Local editing state - only update context when saving
  const [editingProfile, setEditingProfile] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    dateOfBirth: profile.dateOfBirth,
    avatar: profile.avatar
  });

  // Sync editingProfile with profile only once when profile is loaded
  React.useEffect(() => {
    if (!hasSyncedRef.current && profile.firstName) {
      setEditingProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        avatar: profile.avatar
      });
      hasSyncedRef.current = true;
    }
  }, [profile.firstName]); // Only depend on profile.firstName to detect when profile is loaded

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "24"
  });

  const [preferences, setPreferences] = useState({
    language: "nb",
    theme: "system",
    notifications: {
      email: true,
      sms: false,
      push: true,
      bookingReminders: true,
      newBookings: true
    },
    dashboardView: "extended"
  });

  const [loginHistory] = useState([
    { date: "2024-01-20T14:30:00Z", ip: "192.168.1.1", location: "Drammen, Norge", device: "Chrome på Windows" },
    { date: "2024-01-19T09:15:00Z", ip: "192.168.1.1", location: "Drammen, Norge", device: "Safari på iPhone" },
    { date: "2024-01-18T16:45:00Z", ip: "10.0.0.5", location: "Oslo, Norge", device: "Chrome på Mac" }
  ]);

  // Calculate booking statistics
  const bookingStats = useMemo(() => {
    try {
      const pending: readonly unknown[] = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed: readonly unknown[] = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];
      
      // Find last booking
      const lastBooking = all.length > 0 
        ? all.reduce((latest, booking) => {
            if (typeof booking !== 'object' || booking === null) return latest;
            const bookingWithDates = booking as { startDate?: string; date?: string };
            const latestWithDates = latest as { startDate?: string; date?: string };
            const bookingDate = new Date(bookingWithDates.startDate || bookingWithDates.date || new Date().toISOString());
            const latestDate = new Date(latestWithDates.startDate || latestWithDates.date || new Date().toISOString());
            return bookingDate > latestDate ? booking : latest;
          })
        : null;
      
      return {
        totalBookings: all.length,
        lastBooking: lastBooking && typeof lastBooking === 'object' && lastBooking !== null ? {
          date: new Date((lastBooking as { startDate?: string; date?: string }).startDate || (lastBooking as { startDate?: string; date?: string }).date || new Date().toISOString()).toLocaleDateString('nb-NO'),
          facility: (lastBooking as { facilityName?: string; facility?: string }).facilityName || (lastBooking as { facilityName?: string; facility?: string }).facility || 'Ukjent lokale'
        } : null
      };
    } catch (error) {
      return {
        totalBookings: 0,
        lastBooking: null
      };
    }
  }, []);

  // Get favorite facilities
  const favoriteFacilities = useMemo(() => {
    return favorites
      .slice(0, 3)
      .map(fav => getFacilityById(fav.facilityId))
      .filter((facility): facility is NonNullable<ReturnType<typeof getFacilityById>> => Boolean(facility));
  }, [favorites, getFacilityById]);

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sikkerhet", icon: Shield },
    { id: "preferences", label: "Preferanser", icon: Settings },
    { id: "privacy", label: "Personvern", icon: Lock }
  ];

  const showToastMessage = (message: string): void => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Update the auto-save functionality for preferences
  const handlePreferenceChange = <T,>(preference: string, value: T): void => {
    setPreferences(prev => ({ ...prev, [preference]: value }));
    showToastMessage("✔ Lagret");
  };

  // Update the auto-save functionality for notifications
  const handleNotificationChange = (notificationKey: string, value: boolean): void => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notificationKey]: value
      }
    }));
    showToastMessage("✔ Lagret");
  };

  // Update the auto-save functionality for theme
  const handleThemeChange = (theme: string): void => {
    setPreferences(prev => ({ ...prev, theme }));
    showToastMessage("✔ Lagret");
  };

  // Update the auto-save functionality for language
  const handleLanguageChange = (language: string): void => {
    setPreferences(prev => ({ ...prev, language }));
    showToastMessage("✔ Lagret");
  };

  // Update the auto-save functionality for dashboard view
  const handleDashboardViewChange = (view: string): void => {
    setPreferences(prev => ({ ...prev, dashboardView: view }));
    showToastMessage("✔ Lagret");
  };

  const handleSave = (): void => {
    // Update context with all changes
    const updates = { ...editingProfile };
    if (avatarPreview) {
      updates.avatar = avatarPreview;
      setAvatarPreview(null);
    }
    
    updateProfile(updates);
    setIsEditing(false);
    showToastMessage("Endringer lagret");
  };

  const handleCancel = (): void => {
    // Reset to original profile data
    setEditingProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth,
      avatar: profile.avatar
    });
    setIsEditing(false);
    setAvatarPreview(null);
    hasSyncedRef.current = false; // Allow sync again
  };

  const handleInputChange = (field: string, value: string): void => {
    setEditingProfile(prev => {
      const newProfile = { ...prev, [field]: value };
      return newProfile;
    });
  };

  const handlePasswordChange = (field: string, value: string): void => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSave = (): void => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToastMessage("Passordene matcher ikke");
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showToastMessage("Passord oppdatert");
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = (): void => {
    if (deleteConfirmation !== profile.email) {
      showToastMessage("E-postadressen matcher ikke");
      return;
    }
    
    // GDPR-compliant account deletion
    if (window.confirm('Er du helt sikker på at du vil slette kontoen din permanent? Dette kan ikke angres.')) {
      // In a real app, this would call an API to:
      // 1. Anonymize all personal data
      // 2. Delete all bookings and associated data
      // 3. Remove user from all systems
      // 4. Send confirmation email
      // 5. Log the deletion for audit purposes
      
      
      
      // Simulate API call
      setTimeout(() => {
        showToastMessage("Konto slettet permanent. Du vil motta en bekreftelse på e-post.");
        setShowDeleteModal(false);
        setDeleteConfirmation("");
        
        // In a real app, redirect to logout or landing page
        // navigate('/logout');
      }, 1000);
    }
  };

  const togglePasswordVisibility = (field: string): void => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "i går";
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} uker siden`;
    
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderAccountOverview = (): JSX.Element => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatarPreview || profile.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.role} {profile.organization ? ` / ${profile.organization}` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-500">
                <span>Konto opprettet: {new Date(profile.accountCreated).toLocaleDateString('nb-NO')}</span>
                <span>•</span>
                <span>Sist aktiv: {formatDate(profile.lastActive)}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Aktiv konto
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileTab = (): JSX.Element => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personlig informasjon
        </h2>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? "Avbryt" : "Rediger"}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={avatarPreview || profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
              />
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Personlige detaljer
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Fornavn
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Etternavn
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Fødselsdato
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editingProfile.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">
                        {profile.dateOfBirth && profile.dateOfBirth !== "" 
                          ? new Date(profile.dateOfBirth).toLocaleDateString('nb-NO') 
                          : "Ikke oppgitt"}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Kontaktinformasjon
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      E-post
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editingProfile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Telefon
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editingProfile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Adresse
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Lagre endringer
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Avbryt
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = (): JSX.Element => (
    <div className="space-y-8">
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Du kan når som helst endre sikkerhetsinnstillingene dine.
      </div>
      
      {/* Password Change */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Endre passord
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Nåværende passord
            </label>
            <div className="relative">
              <Input
                type={showPassword.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility("currentPassword")}
              >
                {showPassword.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Nytt passord
          </label>
          <div className="relative">
            <Input
              type={showPassword.newPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => togglePasswordVisibility("newPassword")}
            >
              {showPassword.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {/* Password strength indicator */}
          {passwordForm.newPassword && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    passwordForm.newPassword.length < 8 ? 'w-1/4 bg-red-500' :
                    passwordForm.newPassword.length < 12 ? 'w-2/4 bg-yellow-500' :
                    'w-full bg-green-500'
                  }`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {passwordForm.newPassword.length < 8 
                  ? 'Passordet må inneholde minst 8 tegn' 
                  : passwordForm.newPassword.length < 12
                  ? 'Passordet bør inneholde minst 12 tegn for bedre sikkerhet'
                  : 'Godt passord!'}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Bekreft nytt passord
          </label>
          <div className="relative">
            <Input
              type={showPassword.confirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => togglePasswordVisibility("confirmPassword")}
            >
              {showPassword.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Button onClick={handlePasswordSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Oppdater passord
        </Button>
      </CardContent>
    </Card>

    {/* Two-Factor Authentication */}
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Tofaktorautentisering (2FA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">E-post/SMS autentisering</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Få en sikkerhetskode på e-post eller SMS ved innlogging
            </p>
          </div>
          <Button
            variant={securitySettings.twoFactorEnabled ? "outline" : "default"}
            onClick={() => {
              setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
              showToastMessage("✔ Lagret");
            }}
          >
            {securitySettings.twoFactorEnabled ? "Deaktiver" : "Aktiver"}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Login History */}
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Påloggingshistorikk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loginHistory.map((login, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {login.device} — sist brukt i {login.location} {new Date(login.date).toLocaleDateString('nb-NO')}, kl. {new Date(login.date).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{login.ip}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(login.date)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Connected Accounts */}
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Tilknyttede kontoer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Google</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ikke tilknyttet</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Simulate connecting to Google
                showToastMessage("Kobler til Google...");
              }}
            >
              Tilknytt
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Microsoft</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ikke tilknyttet</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Simulate connecting to Microsoft
                showToastMessage("Kobler til Microsoft...");
                // Simulate success after 1 second
                setTimeout(() => {
                  showToastMessage("Tilknyttet – sist oppdatert i dag");
                }, 1000);
              }}
            >
              Tilknytt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

  const renderPreferencesTab = (): JSX.Element => (
    <div className="space-y-8">
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Velg språk og fargetema for Bookme. Du kan når som helst endre dette.
      </div>
      
      {/* Language and Theme */}
      <Card className="bg-gray-50 dark:bg-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Utseende og språk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Språk
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="nb">Norsk (bokmål)</option>
              <option value="nn">Norsk (nynorsk)</option>
              <option value="en">English</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Velg hvilket språk du vil bruke i Bookme
            </p>
          </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Tema
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "light", label: "Lys", icon: Monitor },
              { value: "dark", label: "Mørk", icon: Monitor },
              { value: "system", label: "System", icon: Settings }
            ].map((theme) => {
              const Icon = theme.icon;
              return (
                <Button
                  key={theme.value}
                  variant={preferences.theme === theme.value ? "default" : "outline"}
                  onClick={() => handleThemeChange(theme.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {theme.label}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Velg fargetema for grensesnittet
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Notifications */}
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Varslingsinnstillinger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { 
            key: "email", 
            label: "E-postvarsler", 
            description: "Motta varsler på e-post",
            hint: "Motta e-post når en booking blir bekreftet"
          },
          { 
            key: "sms", 
            label: "SMS-varsler", 
            description: "Motta varsler på SMS",
            hint: "Motta SMS når en booking blir avvist"
          },
          { 
            key: "push", 
            label: "Push-varsler", 
            description: "Motta push-varsler i nettleseren",
            hint: "Motta varslinger i nettleseren når du er logget inn"
          },
          { 
            key: "bookingReminders", 
            label: "Påminnelser", 
            description: "Påminnelse dagen før booking",
            hint: "Få påminnelse om kommende bookinger"
          },
          { 
            key: "newBookings", 
            label: "Nye bookinger", 
            description: "Varsle om nye bookinger",
            hint: "Få beskjed når noen booker lokaler du administrerer"
          }
        ].map((notification) => (
          <div key={notification.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{notification.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{notification.hint}</p>
            </div>
            <Button
              variant={preferences.notifications[notification.key as keyof typeof preferences.notifications] ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationChange(notification.key, !preferences.notifications[notification.key as keyof typeof preferences.notifications])}
            >
              {preferences.notifications[notification.key as keyof typeof preferences.notifications] ? "På" : "Av"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Dashboard View */}
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Dashboardvisning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { 
              value: "compact", 
              label: "Kompakt", 
              description: "Mindre kort og tett layout",
              preview: "▭▭▭\n▭▭▭"
            },
            { 
              value: "extended", 
              label: "Utvidet", 
              description: "Store kort og luftig layout",
              preview: "▭▭\n▭▭\n▭▭"
            }
          ].map((view) => (
            <Button
              key={view.value}
              variant={preferences.dashboardView === view.value ? "default" : "outline"}
              onClick={() => handleDashboardViewChange(view.value)}
              className="flex flex-col items-start h-auto p-4 text-left"
            >
              <span className="font-medium">{view.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{view.description}</span>
              <pre className="text-xs font-mono mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {view.preview}
              </pre>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

  const renderPrivacyTab = (): JSX.Element => (
    <div className="space-y-8">
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Kontroller hvordan dine data brukes og beskyttelse av personvern.
      </div>
      
      {/* Data Download */}
      <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Download className="h-5 w-5" />
            Last ned dine data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Last ned en kopi av alle dine personlige data, inkludert bookinger, kvitteringer og profilinformasjon.
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Last ned data
          </Button>
        </CardContent>
      </Card>

      {/* Temporary Deactivation */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sett kontoen på pause
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Deaktiver kontoen din midlertidig. Du kan reaktivere den når som helst ved å logge inn igjen.
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sett kontoen på pause
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Fjern kontoen for godt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Om du sletter kontoen, fjerner vi alt – inkludert bookinger og personopplysninger. Vi kan dessverre ikke angre dette.
          </p>
          
          {!showDeleteConfirmation ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirmation(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Fjern kontoen for godt
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Er du sikker? Skriv 'SLETT' for å bekrefte.
              </p>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="SLETT"
              />
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "SLETT"}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Bekreft sletting
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmation("");
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
);

  const renderDeleteModal = (): JSX.Element => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Slett konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Er du sikker på at du vil slette kontoen din? Alle bookinger og kvitteringer vil bli slettet permanent.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skriv inn din e-postadresse for å bekrefte: {profile.email}
            </label>
            <Input
              type="email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="amin@example.com"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== profile.email}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slett permanent
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              className="flex-1"
            >
              Avbryt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountActivity = (): JSX.Element => (
    <Card className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Kontoaktivitet
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => navigate('/user/bookings')}
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Bookinger
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {bookingStats.totalBookings}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              totalt antall
            </p>
          </div>
        
          <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Sist gjennomført
            </h3>
            {bookingStats.lastBooking ? (
              <>
                <p className="font-medium text-gray-900 dark:text-white">
                  {bookingStats.lastBooking.date}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {bookingStats.lastBooking.facility}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Ingen bookinger ennå
              </p>
            )}
          </div>
        
          <div 
            className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => navigate('/user/favorites')}
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Favorittlokaler
            </h3>
            {favoriteFacilities.length > 0 ? (
              <div className="flex space-x-2">
                {favoriteFacilities.map((facility) => (
                  <div key={facility.id} className="flex flex-col items-center">
                    {facility.images && facility.images.length > 0 ? (
                      <img 
                        src={facility.images[0]} 
                        alt={facility.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate max-w-[50px]">
                      {facility.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Ingen favoritter
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
);

const renderAccountSummary = (): JSX.Element => (
  <Card className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-blue-500">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
        Kontooversikt
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            Konto-ID: 
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-6 px-2 text-xs"
              onClick={() => navigator.clipboard.writeText(profile.accountId)}
            >
              Vis ID
            </Button>
          </p>
          <p className="font-medium text-gray-900 dark:text-white truncate">
            #{profile.accountId.substring(0, 8)}...
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Opprettet:</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(profile.accountCreated).toLocaleDateString('nb-NO')}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Sist innlogging:</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(profile.lastActive)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Status:</p>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="font-medium text-gray-900 dark:text-white">Aktiv konto</span>
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 flex items-center justify-between">
            Tilknyttede organisasjoner:
            {profile.organization ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {profile.organization}
              </span>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => alert('Koble til organisasjon funksjonalitet kommer snart')}
              >
                Koble til organisasjon
              </Button>
            )}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

  return (
    <div className="space-y-8 pb-8">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">{toastMessage}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Innstillinger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrer din personlige informasjon og kontoinnstillinger
        </p>
      </div>

      {/* Account Overview */}
      {renderAccountOverview()}

      {/* Sticky Tabs */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 pt-4">
        {/* Tabs - Desktop */}
        <div className="hidden md:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tabs - Mobile */}
        <div className="md:hidden">
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between py-3"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="flex items-center">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  if (activeTabData) {
                    const Icon = activeTabData.icon;
                    return (
                      <>
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{activeTabData.label}</span>
                      </>
                    );
                  }
                  return <span>Velg seksjon</span>;
                })()}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
          
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-3 text-left font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardContent className="p-6">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "preferences" && renderPreferencesTab()}
          {activeTab === "privacy" && renderPrivacyTab()}
        </CardContent>
      </Card>

      {/* Account Activity and Summary - Only shown in Profile tab */}
      {activeTab === "profile" && (
        <>
          {renderAccountActivity()}
          {renderAccountSummary()}
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && renderDeleteModal()}
    </div>
  );
};

export default UserProfile;