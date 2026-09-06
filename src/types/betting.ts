export type SlipCategory = 
  | 'MEGA_ACCUMULATOR' 
  | 'BANKER' 
  | 'OVER_UNDER' 
  | 'ROLLOVER' 
  | 'VIP';

export type SlipStatus = 
  | 'PENDING' 
  | 'WON' 
  | 'LOST' 
  | 'VOID';

export type BookmakerCode = 
  | 'SPORTYBET' 
  | 'BET9JA' 
  | '1XBET' 
  | 'BETKING' 
  | 'MSPORT';

export interface Bookmaker {
  id: string;
  code: BookmakerCode;
  name: string;
  brandColor: string;
  affiliateUrlTemplate: string;
  appScheme?: string | null;
}

export interface SlipMatch {
  id: string;
  slipId: string;
  teams: string;
  league?: string;
  marketSelection: string;
  odds: number;
  matchTime: string;
  status: SlipStatus;
}

export interface BettingSlip {
  id: string;
  title: string;
  category: SlipCategory;
  bookmaker: BookmakerCode;
  bookingCode: string;
  totalOdds: number;
  stake: number;
  potentialWin?: number;
  matchCount: number;
  kickoffTime: string;
  status: SlipStatus;
  isPinned: boolean;
  isCutOne: boolean;
  isVip?: boolean;
  copiesCount: number;
  affiliateUrl?: string;
  matches?: SlipMatch[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformMetrics {
  totalSlips: number;
  slipsWon: number;
  slipsLost: number;
  winRate: number;
  totalOddsLanded: number;
}
