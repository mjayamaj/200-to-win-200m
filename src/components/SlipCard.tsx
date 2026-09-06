'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Clock, Trophy, ListOrdered, Share2 } from 'lucide-react';
import { BettingSlip } from '../types/betting';
import { copyToClipboardSafe } from '../lib/clipboard';

interface SlipCardProps {
  slip: BettingSlip;
  onCopySuccess?: (slip: BettingSlip) => void;
  onManualFallbackNeeded?: (code: string) => void;
}

export const SlipCard: React.FC<SlipCardProps> = ({
  slip,
  onCopySuccess,
  onManualFallbackNeeded,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  const potentialWin = (slip.stake * slip.totalOdds).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Countdown timer hook
  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(slip.kickoffTime).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('IN-PLAY');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m left`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [slip.kickoffTime]);

  const handleCopy = async () => {
    const result = await copyToClipboardSafe(slip.bookingCode);
    if (result.success) {
      setCopied(true);
      onCopySuccess?.(slip);
      setTimeout(() => setCopied(false), 2500);
    } else {
      onManualFallbackNeeded?.(slip.bookingCode);
    }
  };

  const getCategoryStyles = () => {
    switch (slip.category) {
      case 'BANKER':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'OVER_UNDER':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'ROLLOVER':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <article
      className={`relative rounded-2xl p-4 transition-all duration-200 backdrop-blur-md ${
        slip.isPinned
          ? 'bg-gradient-to-b from-amber-500/5 to-slate-900 border border-amber-500/40 shadow-xl shadow-amber-500/10'
          : slip.status === 'WON'
          ? 'bg-slate-900/90 border border-emerald-500/40'
          : 'bg-slate-900/80 border border-white/10 hover:border-white/20'
      }`}
    >
      {slip.isPinned && (
        <div className="absolute top-0 right-5 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-extrabold uppercase px-3 py-1 rounded-b-md shadow-md">
          ★ Featured Slip
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 pr-16">
        <span className={`text-[11px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${getCategoryStyles()}`}>
          {slip.category.replace('_', ' ')}
        </span>
        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white">
          {slip.bookmaker}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white text-base font-bold mb-3 leading-snug">{slip.title}</h3>

      {/* Odds and Returns Matrix */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-xl p-3 mb-3">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Odds</span>
          <span className={`text-2xl font-black ${slip.totalOdds > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {slip.totalOdds.toFixed(2)}x
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Potential Return (₦200)</span>
          <span className="text-lg font-bold text-amber-400">₦{potentialWin}</span>
        </div>
      </div>

      {/* Booking Code Box with One-Tap Copy */}
      <div className="flex items-center justify-between bg-slate-950 border border-dashed border-white/20 hover:border-emerald-500 rounded-xl p-3 mb-3 transition-colors">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">{slip.bookmaker} Code</span>
          <span className="font-mono text-xl font-bold tracking-widest text-white">{slip.bookingCode}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-md shadow-emerald-400/20'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
        </button>
      </div>

      {/* Match Meta & Countdown */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
          <span>{slip.matchCount} Matches</span>
        </div>

        {slip.status === 'WON' ? (
          <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded shadow">
            <Trophy className="w-3 h-3" /> WON 🏆
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className={`font-semibold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
              {timeLeft}
            </span>
          </div>
        )}

        {slip.isCutOne && (
          <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
            Cut-1 Active
          </span>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex gap-2">
        <a
          href={slip.affiliateUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl py-2 text-xs font-bold transition-colors"
        >
          <span>Load in {slip.bookmaker}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
