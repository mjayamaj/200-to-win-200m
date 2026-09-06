'use client';

import React, { useState } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';
import { BettingSlip, SlipCategory, BookmakerCode } from '../types/betting';

interface AdminSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSlip: (newSlip: Omit<BettingSlip, 'id' | 'copiesCount'>) => void;
}

export const AdminSlipModal: React.FC<AdminSlipModalProps> = ({
  isOpen,
  onClose,
  onPublishSlip,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SlipCategory>('MEGA_ACCUMULATOR');
  const [bookmaker, setBookmaker] = useState<BookmakerCode>('SPORTYBET');
  const [bookingCode, setBookingCode] = useState('');
  const [totalOdds, setTotalOdds] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(18);
  const [kickoffHours, setKickoffHours] = useState<number>(2.5);
  const [isPinned, setIsPinned] = useState(true);
  const [isCutOne, setIsCutOne] = useState(true);

  if (!isOpen) return null;

  const numericOdds = parseFloat(totalOdds) || 0;
  const potentialReturn = (200 * numericOdds).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode || !totalOdds) return;

    onPublishSlip({
      title: title || `${bookmaker} ${category.replace('_', ' ')} Slip`,
      category,
      bookmaker,
      bookingCode: bookingCode.toUpperCase().trim(),
      totalOdds: numericOdds,
      stake: 200,
      matchCount,
      kickoffTime: new Date(Date.now() + kickoffHours * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      isPinned,
      isCutOne,
      affiliateUrl: `https://${bookmaker.toLowerCase()}.com/ng/?ref=200to200m&code=${bookingCode.toUpperCase()}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              Admin Fast Ops
            </span>
            <h2 className="text-white text-lg font-black flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Publish Slip (Under 60s)
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Slip Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend 20-Game Longshot"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SlipCategory)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              >
                <option value="MEGA_ACCUMULATOR">₦200M Mega</option>
                <option value="BANKER">Daily Banker</option>
                <option value="OVER_UNDER">Over/Under</option>
                <option value="ROLLOVER">Rollover</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bookmaker</label>
              <select
                value={bookmaker}
                onChange={(e) => setBookmaker(e.target.value as BookmakerCode)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              >
                <option value="STAKE.COM">Stake.com</option>
                <option value="SPORTYBET">SportyBet</option>
                <option value="BET9JA">Bet9ja</option>
                <option value="1XBET">1xBet</option>
                <option value="BETKING">BetKing</option>
                <option value="MSPORT">MSport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Booking Code</label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="e.g. BC982Z"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold tracking-wider text-sm focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Total Odds</label>
              <input
                type="number"
                step="0.01"
                value={totalOdds}
                onChange={(e) => setTotalOdds(e.target.value)}
                placeholder="e.g. 542.80"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Realtime Payout Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-slate-300">Potential Return (Stake ₦200):</span>
            <span className="text-emerald-400 font-bold text-sm">₦{potentialReturn}</span>
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-white/20 bg-slate-950 text-emerald-500"
              />
              Pin to Top
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isCutOne}
                onChange={(e) => setIsCutOne(e.target.checked)}
                className="rounded border-white/20 bg-slate-950 text-emerald-500"
              />
              Cut-1 Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              Publish Slip Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
