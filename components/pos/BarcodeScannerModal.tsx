'use client';

import { useEffect, useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: Props) {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    let isMounted = true;

    // Carga dinámica exclusiva en el navegador para prevenir errores de SSR en Vercel
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        if (!isMounted) return;

        const scanner = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.5,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            if (isMounted) onScan(decodedText);
          },
          (errorMessage) => {
            // Ignorar errores continuos de búsqueda de frame
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('Error cargando lector de código de barras:', err);
      }
    };

    const timer = setTimeout(initScanner, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err: any) => console.error('Error cerrando escáner:', err));
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative border border-emerald-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Escáner de Código de Barras</h3>
            <p className="text-xs text-gray-400">Apunta la cámara del dispositivo al código de barras del producto</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-2 min-h-[300px]">
          <div id="reader" className="w-full"></div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
}
