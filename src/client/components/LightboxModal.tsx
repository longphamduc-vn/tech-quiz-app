import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Download } from 'lucide-react';
import { LightboxState } from '../types/index.js';

interface LightboxModalProps {
  state: LightboxState;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ state, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom on open
  useEffect(() => {
    if (state.isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [state.isOpen, state.url]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!state.isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 4));
      if (e.key === '-' || e.key === '_') setScale((s) => Math.max(s - 0.25, 0.5));
      if (e.key === '0') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    },
    [state.isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!state.isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-semibold text-white">{state.altText || 'Media Asset'}</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400">{Math.round(scale * 100)}%</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 4))}
            title="Zoom In (+)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            title="Zoom Out (-)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            title="Reset Zoom (0)"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer"
            title="Open Full Image"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Maximize2 className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition ml-2 border-l border-slate-700/60 pl-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container with Zoom & Pan */}
      <div
        className="relative max-w-5xl max-h-[82vh] p-4 flex flex-col items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={state.url}
          alt={state.altText}
          className="max-h-[74vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-75 border border-slate-700/50 bg-slate-900/50"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
          draggable={false}
        />

        {/* Caption Card */}
        {state.caption && (
          <div className="mt-4 px-6 py-2.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-center shadow-lg backdrop-blur-md max-w-2xl">
            <p className="text-sm font-medium text-slate-200">{state.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};
