export type BoardType = 'tharsis' | 'hellas' | 'elysium';

export interface Milestone {
  id: string;
  name: string;
  req: string;
  claimedBy?: string; // player ID
}

export interface AwardDefinition {
  id: string;
  name: string;
  desc: string;
}

export interface AwardSlotState {
  slot: number;
  funded: boolean;
  awardId: string;
  firstPlace: string[]; // player IDs
  secondPlace: string[]; // player IDs
}

export type OfficialPlayerColorName = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Charcoal';
export type OfficialPlayerColor = '#e74c3c' | '#3498db' | '#2ecc71' | '#f1c40f' | '#34495e';

export interface Player {
  id: string;
  name: string;
  color: string;
  corporation: string;
  tr: number;
  greeneries: number;
  cityAdjacencies: number;
  hasCapital: boolean;
  capitalOceans: number;
  hasCommercialDistrict: boolean;
  commercialCities: number;
  cardsVP: number;
  megacredits: number;
  isChairman: boolean;
  partyLeaders: number;
}

export interface AwardWin {
  award: string;
  place: 1 | 2;
  vp: number;
  tied: boolean;
}

export interface PlayerResult {
  id: string;
  name: string;
  color: string;
  corporation: string;
  tr: number;
  milestonesVP: number;
  awardsVP: number;
  greeneryVP: number;
  citiesVP: number;
  cardsVP: number;
  turmoilVP: number;
  megacredits: number;
  totalVP: number;
  rank: number;
  isWinner: boolean;
  tiebreakWon: boolean;
  milestonesClaimed: string[];
  awardsWon: AwardWin[];
}

export interface GameSettings {
  turmoil: boolean;
  venus: boolean;
}

export interface GameState {
  numPlayers: number;
  players: Player[];
  boardMilestones: BoardType;
  boardAwards: BoardType;
  settings: GameSettings;
  milestones: Milestone[];
  awards: AwardSlotState[];
}

export interface CalculationResult {
  results: PlayerResult[];
  claimedCount: number;
  fundedCount: number;
}

export type AppScreen = 'setup' | 'walkthrough' | 'podium';
export type WalkthroughStep = 1 | 2 | 3 | 4;
