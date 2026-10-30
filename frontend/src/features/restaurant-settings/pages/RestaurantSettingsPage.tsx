import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminRestaurant,
  updateAdminRestaurant,
  uploadRestaurantLogo,
} from '../../../services/api';
import { Restaurant } from '../../../types';
import {
  Store,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

export const RestaurantSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['adminRestaurantProfile'],
    queryFn: fetchAdminRestaurant,
  });

  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || '');
      setContactNumber(restaurant.contact_number || '');
      setAddress(restaurant.address || '');
      setOpeningHours(restaurant.opening_hours || '');
      setCurrency(restaurant.currency || '₹');
      setLogoUrl(restaurant.logo_url || '');
    }
  }, [restaurant]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Restaurant>) => updateAdminRestaurant(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminRestaurantProfile'], updated);
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Failed to update restaurant profile.');
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setErrorMessage(null);
      const res = await uploadRestaurantLogo(file);
      setLogoUrl(res.url);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Restaurant name is required.');
      return;
    }

    setErrorMessage(null);
    updateMutation.mutate({
      name: name.trim(),
      contact_number: contactNumber.trim() || null,
      address: address.trim() || null,
      opening_hours: openingHours.trim() || null,
      currency: currency.trim() || '₹',
      logo_url: logoUrl || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Restaurant Profile & Branding
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Customize your establishment details shown across the public digital menu and printed QR displays.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Restaurant profile and digital menu header updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#141620] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Logo Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Restaurant Brand Logo
            </label>
            <div className="flex items-center gap-5">
              {logoUrl ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black/40 shrink-0 shadow-lg">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:text-rose-400"
                    title="Remove Logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 shrink-0 bg-white/[0.02]">
                  <Store className="w-8 h-8 opacity-40" />
                </div>
              )}

              <label className="flex-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-300 font-medium">
                  {uploadingLogo ? 'Uploading Logo...' : 'Upload Brand Logo'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPEG or WebP recommended</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Currency Symbol */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Default Menu Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={5}
                required
                className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Operating Hours</span>
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Mon - Sun: 11:30 AM - 11:00 PM"
                className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Restaurant Address</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full physical location displayed on menu header..."
              className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving Settings...' : 'Save Restaurant Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
