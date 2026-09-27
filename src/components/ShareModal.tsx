import React, { useState, useMemo } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Printer, 
  MessageSquare, 
  Sparkles, 
  Database,
  ExternalLink
} from 'lucide-react';
import { GroceryItem } from '../types';
import { formatWhatsAppMessage, getWhatsAppShareUrl, exportItemsToCSV } from '../utils/whatsappFormatter';
import { Storage } from '../utils/storage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
  currency: string;
  onDataRestored: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onDataRestored,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'csv' | 'backup'>('whatsapp');
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const formattedWhatsApp = useMemo(() => {
    return formatWhatsAppMessage(items, currency, 'Weekly Grocery Shopping List');
  }, [items, currency]);

  if (!isOpen) return null;

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(formattedWhatsApp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportItemsToCSV(items, currency);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Grocery_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBackup = () => {
    const backupJson = Storage.exportAllData();
    const blob = new Blob([backupJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CartManager_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = () => {
    if (!importJsonText.trim()) return;
    const success = Storage.importAllData(importJsonText);
    if (success) {
      setImportStatus('Data restored successfully!');
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1000);
    } else {
      setImportStatus('Invalid backup file. Please verify JSON format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportJsonText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8 animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
                Share & Export Grocery Plan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Send to WhatsApp, download CSV spreadsheet, or backup data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 my-4 p-1 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Ready</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>
        </div>

        {/* WhatsApp Preview Tab */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Formatted Text (Formatted for WhatsApp with emojis & fallback alternatives):
              </label>
              <textarea
                readOnly
                value={formattedWhatsApp}
                rows={10}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none select-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print List</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-whatsapp-text"
                  onClick={handleCopyWhatsApp}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                </button>

                <a
                  href={getWhatsAppShareUrl(formattedWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CSV Spreadsheet Tab */}
        {activeTab === 'csv' && (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Export Active List to Excel / CSV
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Download a structured `.csv` file containing Item Name, Brand, Category, Weight, Units, Estimated & Actual Prices, and Notes.
                </p>
              </div>
              <button
                id="btn-download-csv"
                onClick={handleDownloadCSV}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Spreadsheet</span>
              </button>
            </div>
          </div>
        )}

        {/* Backup & Restore JSON Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    Export Full App Data
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Save all items, trip logs, custom staples, and monthly budgets
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                  Restore / Import Backup
                </h4>
                <label className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer flex items-center gap-1 border border-zinc-200 dark:border-zinc-800">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Or paste backup JSON code here..."
                rows={4}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />

              {importStatus && (
                <p className={`text-xs font-semibold ${importStatus.includes('success') ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {importStatus}
                </p>
              )}

              <button
                onClick={handleImportJSON}
                disabled={!importJsonText.trim()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all ${
                  importJsonText.trim()
                    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                    : 'bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                Restore Data from JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
