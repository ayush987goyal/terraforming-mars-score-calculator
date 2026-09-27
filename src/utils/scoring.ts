import { GameState, CalculationResult, PlayerResult, AwardWin } from '../types';
import { BOARD_DATA, VENUS_AWARD } from '../data/gameData';

export function calculateScores(state: GameState): CalculationResult {
  const numPlayers = state.players.length;

  const results: PlayerResult[] = state.players.map(p => ({
    id: p.id,
    name: p.name.trim() || `Player ${p.id.replace('p', '')}`,
    color: p.color,
    corporation: p.corporation,
    tr: Number(p.tr) || 0,
    milestonesVP: 0,
    awardsVP: 0,
    greeneryVP: Number(p.greeneries) || 0,
    citiesVP: 0,
    cardsVP: Number(p.cardsVP) || 0,
    turmoilVP: 0,
    megacredits: Number(p.megacredits) || 0,
    totalVP: 0,
    rank: 1,
    isWinner: false,
    tiebreakWon: false,
    milestonesClaimed: [],
    awardsWon: []
  }));

  const playerMap = new Map<string, PlayerResult>();
  results.forEach(r => playerMap.set(r.id, r));

  // 1. Milestones (5 VP each, maximum 3 game-wide)
  let claimedCount = 0;
  state.milestones.forEach(m => {
    if (m.claimedBy && playerMap.has(m.claimedBy)) {
      claimedCount++;
      const pRes = playerMap.get(m.claimedBy)!;
      pRes.milestonesVP += 5;
      pRes.milestonesClaimed.push(m.name);
    }
  });

  // 2. Awards: 1st = 5 VP, 2nd = 2 VP
  // Rules:
  // - 2-player games: 0 VP for 2nd place
  // - 1st place tie: gives 5 VP to each tied player and cancels 2nd place
  // - 2nd place tie: gives 2 VP to each tied player
  const availableAwards = [...BOARD_DATA[state.boardAwards].awards];
  if (state.settings.venus) {
    availableAwards.push(VENUS_AWARD);
  }

  let fundedCount = 0;
  state.awards.forEach(a => {
    if (!a.funded || !a.awardId) return;
    fundedCount++;

    const awardObj = availableAwards.find(item => item.id === a.awardId);
    const awardName = awardObj ? awardObj.name : 'Award';

    const validFirst = (a.firstPlace || []).filter(id => playerMap.has(id));
    const validSecond = (a.secondPlace || []).filter(id => playerMap.has(id));

    if (validFirst.length > 0) {
      const isFirstTied = validFirst.length > 1;

      validFirst.forEach(id => {
        const pRes = playerMap.get(id)!;
        pRes.awardsVP += 5;
        pRes.awardsWon.push({
          award: awardName,
          place: 1,
          vp: 5,
          tied: isFirstTied
        });
      });

      // 2nd place is only awarded if exactly ONE 1st place winner AND game has > 2 players
      if (!isFirstTied && numPlayers > 2) {
        const isSecondTied = validSecond.length > 1;
        validSecond.forEach(id => {
          const pRes = playerMap.get(id)!;
          pRes.awardsVP += 2;
          pRes.awardsWon.push({
            award: awardName,
            place: 2,
            vp: 2,
            tied: isSecondTied
          });
        });
      }
    }
  });

  // 3. City Adjacency & Special Tiles
  state.players.forEach(p => {
    const res = playerMap.get(p.id)!;
    let cityPoints = Number(p.cityAdjacencies) || 0;
    if (p.hasCapital) {
      cityPoints += Number(p.capitalOceans) || 0;
    }
    if (p.hasCommercialDistrict) {
      cityPoints += Number(p.commercialCities) || 0;
    }
    res.citiesVP = cityPoints;
  });

  // 4. Turmoil Expansion
  if (state.settings.turmoil) {
    state.players.forEach(p => {
      const res = playerMap.get(p.id)!;
      let tVp = 0;
      if (p.isChairman) tVp += 1;
      tVp += Math.min(6, Math.max(0, Number(p.partyLeaders) || 0));
      res.turmoilVP = tVp;
    });
  }

  // 5. Total VP Sum
  results.forEach(r => {
    r.totalVP = r.tr + r.milestonesVP + r.awardsVP + r.greeneryVP + r.citiesVP + r.cardsVP + r.turmoilVP;
  });

  // 6. Ranking and Tiebreaking
  // Primary: Total VP descending
  // Secondary: MegaCredits Cash descending
  results.sort((a, b) => {
    if (b.totalVP !== a.totalVP) {
      return b.totalVP - a.totalVP;
    }
    return b.megacredits - a.megacredits;
  });

  // Rank assignment
  for (let i = 0; i < results.length; i++) {
    if (i > 0) {
      const prev = results[i - 1];
      const curr = results[i];
      if (curr.totalVP === prev.totalVP && curr.megacredits === prev.megacredits) {
        curr.rank = prev.rank;
      } else {
        curr.rank = i + 1;
      }
    } else {
      results[i].rank = 1;
    }
  }

  // Determine winners
  const topRank = results[0]?.rank || 1;
  const winners = results.filter(r => r.rank === topRank);
  winners.forEach(w => {
    w.isWinner = true;
  });

  if (winners.length === 1 && results.length > 1) {
    const winner = winners[0];
    const second = results[1];
    if (winner.totalVP === second.totalVP && winner.megacredits > second.megacredits) {
      winner.tiebreakWon = true;
    }
  }

  return { results, claimedCount, fundedCount };
}

export function generateMatchReport(results: PlayerResult[], turmoilEnabled: boolean): string {
  let md = `🪐 **TERRAFORMING MARS - MATCH RESULTS**\n\n`;

  results.forEach(r => {
    const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`;
    md += `${medal} **${r.name}** (${r.corporation}) — **${r.totalVP} VP** (${r.megacredits} M€)\n`;
    md += `   • Breakdown: TR ${r.tr} | Milestones ${r.milestonesVP} | Awards ${r.awardsVP} | Greeneries ${r.greeneryVP} | Cities ${r.citiesVP} | Cards ${r.cardsVP}`;
    if (turmoilEnabled) {
      md += ` | Turmoil ${r.turmoilVP}`;
    }
    md += `\n`;
  });

  const winner = results[0];
  if (winner) {
    const tiedWinners = results.filter(r => r.rank === 1);
    if (tiedWinners.length > 1) {
      md += `\n🤝 **Co-Winners (Tie):** ${tiedWinners.map(w => w.name).join(' & ')} tied with ${winner.totalVP} VP and ${winner.megacredits} M€ cash!`;
    } else if (winner.tiebreakWon) {
      const second = results[1];
      md += `\n🏆 **Winner:** ${winner.name} (won via tiebreaker: ${winner.megacredits} vs ${second.megacredits} M€ cash!)`;
    } else {
      md += `\n🏆 **Winner:** ${winner.name}!`;
    }
  }

  return md;
}
