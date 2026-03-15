import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ScanFace, ShieldCheck, AlertTriangle, Camera } from 'lucide-react';
import Image from 'next/image';

interface Props {
  onImageSelect: (file: File, preview: string) => void;
  processing?: boolean;
}

export default function FaceScanner({ onImageSelect, processing = false }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScanning(true);
    setTimeout(() => setScanning(false), 1500);
    onImageSelect(file, url);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: processing,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 bg-panel/50'}
          ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{ minHeight: 280 }}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative w-full" style={{ height: 280 }}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />

            {/* Scan overlay */}
            {(scanning || processing) && (
              <div className="absolute inset-0 bg-ink/40 flex flex-col items-center justify-center gap-3">
                <div className="relative w-full h-full">
                  <div className="scan-line" />
                  {/* Corner markers */}
                  {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-6 h-6 corner-pulse`}
                      style={{
                        borderColor: '#4F8EF7',
                        borderTopWidth: i < 2 ? 2 : 0,
                        borderBottomWidth: i >= 2 ? 2 : 0,
                        borderLeftWidth: i % 2 === 0 ? 2 : 0,
                        borderRightWidth: i % 2 === 1 ? 2 : 0,
                      }} />
                  ))}
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-xs font-mono text-accent animate-pulse">
                    {processing ? '● ANALYZING BIOMETRICS...' : '● FACE DETECTION ACTIVE'}
                  </span>
                </div>
              </div>
            )}

            {/* Done overlay */}
            {!scanning && !processing && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-success/20 border border-success/40 rounded-full px-2 py-1">
                <ShieldCheck size={12} className="text-success" />
                <span className="text-[10px] font-mono text-success">FACE CAPTURED</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-10" style={{ minHeight: 280 }}>
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <ScanFace size={36} className="text-accent" />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-2xl border-2 border-accent animate-ping" />
              )}
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-semibold text-text">
                {isDragActive ? 'Drop image here' : 'Upload face image'}
              </div>
              <div className="text-xs text-text-dim">
                Drag & drop or click • JPG, PNG, WEBP
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
              <Camera size={12} className="text-text-dim" />
              <span className="text-[10px] font-mono text-text-dim">SECURE UPLOAD — IMAGE NOT STORED</span>
            </div>
          </div>
        )}
      </div>

      {/* Privacy badge */}
      <div className="flex items-center gap-2 p-3 bg-surface/60 rounded-xl border border-border/60">
        <ShieldCheck size={14} className="text-success shrink-0" />
        <p className="text-[11px] text-text-dim leading-relaxed">
          <span className="text-success font-semibold">Privacy-Safe:</span>{' '}
          Your image is converted to an encrypted facial embedding and immediately discarded. No photos are stored on our servers.
        </p>
      </div>
    </div>
  );
}
