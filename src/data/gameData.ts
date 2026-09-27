import { BoardType, Milestone, AwardDefinition, Player, GameState } from '../types';

export const CORPORATIONS: string[] = [
  "Tharsis Republic", "CrediCor", "Ecoline", "Helion", "Mining Guild",
  "Interplanetary Cinematics", "Inventrix", "Phobolog", "Thorgate",
  "United Nations Mars Initiative", "Saturn Systems", "Teractor",
  "Aphrodite", "Celestic", "Manutech", "Morning Star Inc", "Viron",
  "Point Luna", "Robinson Industries", "Valley Trust", "Vitor",
  "Aridor", "Arklight", "Polymorph", "Poseidon", "Stormcraft",
  "Lakefront Resorts", "Pristar", "Septem Tribus", "Terralabs",
  "Utopia Invest", "Factorum", "Mons Insurance", "Philures", "Pharmacy Union",
  "Custom / Other"
];

export interface BoardPreset {
  milestones: Milestone[];
  awards: AwardDefinition[];
}

export const BOARD_DATA: Record<BoardType, BoardPreset> = {
  tharsis: {
    milestones: [
      { id: "terraformer", name: "Terraformer", req: "TR 35 or more" },
      { id: "mayor", name: "Mayor", req: "3 or more city tiles" },
      { id: "gardener", name: "Gardener", req: "3 or more greenery tiles" },
      { id: "builder", name: "Builder", req: "8 or more building tags" },
      { id: "planner", name: "Planner", req: "16 or more cards in hand" }
    ],
    awards: [
      { id: "landlord", name: "Landlord", desc: "Most tiles owned on board" },
      { id: "banker", name: "Banker", desc: "Highest M€ production" },
      { id: "scientist", name: "Scientist", desc: "Most science tags in play" },
      { id: "thermalist", name: "Thermalist", desc: "Most heat resources on hand" },
      { id: "miner", name: "Miner", desc: "Most steel and titanium resources" }
    ]
  },
  hellas: {
    milestones: [
      { id: "diversifier", name: "Diversifier", req: "8 different tags in play" },
      { id: "tactician", name: "Tactician", req: "5 cards with requirements" },
      { id: "polar_explorer", name: "Polar Explorer", req: "3 tiles on bottom two rows" },
      { id: "energizer", name: "Energizer", req: "6 energy production" },
      { id: "rim_settler", name: "Rim Settler", req: "3 Jovian tags in play" }
    ],
    awards: [
      { id: "cultivator", name: "Cultivator", desc: "Most greenery tiles" },
      { id: "magnate", name: "Magnate", desc: "Most automated green cards in play" },
      { id: "space_baron", name: "Space Baron", desc: "Most space tags in play" },
      { id: "eccentric", name: "Eccentric", desc: "Most resources on cards" },
      { id: "contractor", name: "Contractor", desc: "Most building tags in play" }
    ]
  },
  elysium: {
    milestones: [
      { id: "generalist", name: "Generalist", req: "Increase all 6 productions by >= 1" },
      { id: "specialist", name: "Specialist", req: ">= 10 of any single production" },
      { id: "ecologist", name: "Ecologist", req: "4 bio tags (plant, microbe, animal)" },
      { id: "tycoon", name: "Tycoon", req: "15 project cards played" },
      { id: "legend", name: "Legend", req: "5 event cards played" }
    ],
    awards: [
      { id: "celebrity", name: "Celebrity", desc: "Most non-event cards costing >= 20 M€" },
      { id: "industrialist", name: "Industrialist", desc: "Most steel and energy resources" },
      { id: "desert_settler", name: "Desert Settler", desc: "Most tiles south of equator" },
      { id: "estate_dealer", name: "Estate Dealer", desc: "Most tiles adjacent to oceans" },
      { id: "benefactor", name: "Benefactor", desc: "Highest Terraform Rating (TR)" }
    ]
  }
};

export const VENUS_MILESTONE: Milestone = {
  id: "hoverlord",
  name: "Hoverlord",
  req: "7 or more floaters on cards"
};

export const VENUS_AWARD: AwardDefinition = {
  id: "venuphile",
  name: "Venuphile",
  desc: "Most Venus tags in play"
};

export const DEFAULT_PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Player 1",
    color: "#e74c3c",
    corporation: "Tharsis Republic",
    tr: 20,
    greeneries: 0,
    cityAdjacencies: 0,
    hasCapital: false,
    capitalOceans: 0,
    hasCommercialDistrict: false,
    commercialCities: 0,
    cardsVP: 0,
    megacredits: 15,
    isChairman: false,
    partyLeaders: 0
  },
  {
    id: "p2",
    name: "Player 2",
    color: "#3498db",
    corporation: "CrediCor",
    tr: 20,
    greeneries: 0,
    cityAdjacencies: 0,
    hasCapital: false,
    capitalOceans: 0,
    hasCommercialDistrict: false,
    commercialCities: 0,
    cardsVP: 0,
    megacredits: 15,
    isChairman: false,
    partyLeaders: 0
  },
  {
    id: "p3",
    name: "Player 3",
    color: "#2ecc71",
    corporation: "Ecoline",
    tr: 20,
    greeneries: 0,
    cityAdjacencies: 0,
    hasCapital: false,
    capitalOceans: 0,
    hasCommercialDistrict: false,
    commercialCities: 0,
    cardsVP: 0,
    megacredits: 15,
    isChairman: false,
    partyLeaders: 0
  },
  {
    id: "p4",
    name: "Player 4",
    color: "#f1c40f",
    corporation: "Helion",
    tr: 20,
    greeneries: 0,
    cityAdjacencies: 0,
    hasCapital: false,
    capitalOceans: 0,
    hasCommercialDistrict: false,
    commercialCities: 0,
    cardsVP: 0,
    megacredits: 15,
    isChairman: false,
    partyLeaders: 0
  },
  {
    id: "p5",
    name: "Player 5",
    color: "#7f8c8d",
    corporation: "Mining Guild",
    tr: 20,
    greeneries: 0,
    cityAdjacencies: 0,
    hasCapital: false,
    capitalOceans: 0,
    hasCommercialDistrict: false,
    commercialCities: 0,
    cardsVP: 0,
    megacredits: 15,
    isChairman: false,
    partyLeaders: 0
  }
];

export function getInitialGameState(): GameState {
  const boardMilestones: BoardType = 'tharsis';
  const boardAwards: BoardType = 'tharsis';
  return {
    numPlayers: 4,
    players: JSON.parse(JSON.stringify(DEFAULT_PLAYERS.slice(0, 4))),
    boardMilestones,
    boardAwards,
    settings: {
      turmoil: false,
      venus: false
    },
    milestones: BOARD_DATA[boardMilestones].milestones.map(m => ({ ...m, claimedBy: '' })),
    awards: [
      { slot: 1, funded: false, awardId: '', firstPlace: [], secondPlace: [] },
      { slot: 2, funded: false, awardId: '', firstPlace: [], secondPlace: [] },
      { slot: 3, funded: false, awardId: '', firstPlace: [], secondPlace: [] }
    ]
  };
}

export function getSampleGameState(): GameState {
  return {
    numPlayers: 4,
    players: [
      {
        id: "p1",
        name: "Alice",
        color: "#e74c3c",
        corporation: "Tharsis Republic",
        tr: 34,
        greeneries: 8,
        cityAdjacencies: 14,
        hasCapital: true,
        capitalOceans: 3,
        hasCommercialDistrict: true,
        commercialCities: 2,
        cardsVP: 18,
        megacredits: 14,
        isChairman: false,
        partyLeaders: 1
      },
      {
        id: "p2",
        name: "Bob",
        color: "#3498db",
        corporation: "CrediCor",
        tr: 34,
        greeneries: 4,
        cityAdjacencies: 8,
        hasCapital: false,
        capitalOceans: 0,
        hasCommercialDistrict: false,
        commercialCities: 0,
        cardsVP: 29,
        megacredits: 26, // Won on tiebreaker over Alice!
        isChairman: true,
        partyLeaders: 2
      },
      {
        id: "p3",
        name: "Charlie",
        color: "#2ecc71",
        corporation: "Ecoline",
        tr: 32,
        greeneries: 12,
        cityAdjacencies: 10,
        hasCapital: false,
        capitalOceans: 0,
        hasCommercialDistrict: false,
        commercialCities: 0,
        cardsVP: 14,
        megacredits: 8,
        isChairman: false,
        partyLeaders: 1
      },
      {
        id: "p4",
        name: "Diana",
        color: "#f1c40f",
        corporation: "Helion",
        tr: 36,
        greeneries: 5,
        cityAdjacencies: 6,
        hasCapital: false,
        capitalOceans: 0,
        hasCommercialDistrict: false,
        commercialCities: 0,
        cardsVP: 22,
        megacredits: 18,
        isChairman: false,
        partyLeaders: 0
      }
    ],
    boardMilestones: 'tharsis',
    boardAwards: 'tharsis',
    settings: {
      turmoil: true,
      venus: false
    },
    milestones: [
      { id: "terraformer", name: "Terraformer", req: "TR 35 or more", claimedBy: "" },
      { id: "mayor", name: "Mayor", req: "3 or more city tiles", claimedBy: "p1" },
      { id: "gardener", name: "Gardener", req: "3 or more greenery tiles", claimedBy: "p3" },
      { id: "builder", name: "Builder", req: "8 or more building tags", claimedBy: "p2" },
      { id: "planner", name: "Planner", req: "16 or more cards in hand", claimedBy: "" }
    ],
    awards: [
      { slot: 1, funded: true, awardId: "landlord", firstPlace: ["p1"], secondPlace: ["p3"] },
      { slot: 2, funded: true, awardId: "banker", firstPlace: ["p2", "p4"], secondPlace: [] }, // 1st place tie test
      { slot: 3, funded: true, awardId: "thermalist", firstPlace: ["p4"], secondPlace: ["p2"] }
    ]
  };
}
