import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminRestaurant } from '../../../services/api';
import {
  Download,
  Printer,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const QRManagementPage: React.FC = () => {
  const [qrSize, setQrSize] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: restaurant } = useQuery({
    queryKey: ['adminRestaurantProfile'],
    queryFn: fetchAdminRestaurant,
  });

  const menuUrl = `${window.location.origin}/menu`;
  const qrDownloadUrl = `/api/v1/admin/qr/download?size=${qrSize}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          QR Code Studio
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Generate, download, and print permanent high-resolution QR codes for table tents and restaurant counters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Printable Card Preview */}
        <div className="bg-[#141620] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="w-full max-w-xs bg-white text-black p-6 rounded-2xl shadow-xl flex flex-col items-center print:shadow-none print:border print:border-black">
            {/* Header branding on card */}
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-700 mb-1">
              Scan For Digital Menu
            </p>
            <h3 className="font-serif text-xl font-bold text-gray-900 tracking-tight mb-4">
              {restaurant?.name || 'Aatitheyam Cafe & Bhojnalaya'}
            </h3>

            {/* QR Code Graphic from Backend Service */}
            <div className="w-48 h-48 bg-white p-2 rounded-xl border-2 border-gray-100 shadow-inner flex items-center justify-center">
              <img
                src={qrDownloadUrl}
                alt="Restaurant Digital Menu QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] font-semibold text-gray-700 mt-4">
              Point your camera to view dishes & prices
            </p>
            <p className="text-[9px] text-gray-400 mt-1 font-mono">
              View-Only Live Digital Menu
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Permanent URL • Never expires after menu updates</span>
          </div>
        </div>

        {/* Configuration & Actions */}
        <div className="space-y-6">
          {/* Target URL Card */}
          <div className="bg-[#141620] border border-white/5 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Stable Target Menu URL
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={menuUrl}
                className="flex-1 bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-200 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              When customers scan the QR code with their phone camera, it directs them directly to this URL without authentication.
            </p>
          </div>

          {/* Resolution Multiplier Selector */}
          <div className="bg-[#141620] border border-white/5 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Export Resolution Multiplier
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((size) => (
                <button
                  key={size}
                  onClick={() => setQrSize(size)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    qrSize === size
                      ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-[#1b1e2a] text-gray-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {size === 10 ? 'Standard' : size === 15 ? 'HD' : size === 20 ? 'Ultra HD' : 'Print 300DPI'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500">
              Selected size multiplier: <strong>{qrSize}x</strong>. Higher resolutions ensure crisp lines on physical table acrylics.
            </p>
          </div>

          {/* Download & Print Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={qrDownloadUrl}
              download="restaurant-digital-menu-qr.png"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG QR Code</span>
            </a>

            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Table Display</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
