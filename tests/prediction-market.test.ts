import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity contract state
let markets = new Map();
let marketStakes = new Map();
let lastMarketId = 0;
let blockHeight = 1;

// Mock Clarity functions
function createMarket(caller: string, description: string, options: string[], deadline: number): { type: string; value: number } {
  const newMarketId = ++lastMarketId;
  markets.set(newMarketId, {
    creator: caller,
    description,
    options,
    totalStake: 0,
    deadline,
    resolved: false,
    winningOption: null
  });
  return { type: 'ok', value: newMarketId };
}

function placeBet(caller: string, marketId: number, option: number, amount: number): { type: string; value: boolean } {
  const market = markets.get(marketId);
  if (!market) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (blockHeight >= market.deadline) {
    return { type: 'err', value: 105 }; // err-deadline-passed
  }
  if (option !== 0 && option !== 1) {
    return { type: 'err', value: 104 }; // err-invalid-value
  }
  
  const key = `${marketId}-${caller}`;
  const userStake = marketStakes.get(key) || { option0Stake: 0, option1Stake: 0 };
  
  if (option === 0) {
    userStake.option0Stake += amount;
  } else {
    userStake.option1Stake += amount;
  }
  
  marketStakes.set(key, userStake);
  market.totalStake += amount;
  markets.set(marketId, market);
  
  return { type: 'ok', value: true };
}

function resolveMarket(caller: string, marketId: number, winningOption: number): { type: string; value: boolean } {
  const market = markets.get(marketId);
  if (!market) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (caller !== market.creator) {
    return { type: 'err', value: 102 }; // err-unauthorized
  }
  if (blockHeight < market.deadline) {
    return { type: 'err', value: 104 }; // err-invalid-value
  }
  if (market.resolved) {
    return { type: 'err', value: 103 }; // err-already-exists
  }
  if (winningOption !== 0 && winningOption !== 1) {
    return { type: 'err', value: 104 }; // err-invalid-value
  }
  
  market.resolved = true;
  market.winningOption = winningOption;
  markets.set(marketId, market);
  
  return { type: 'ok', value: true };
}

function claimWinnings(caller: string, marketId: number): { type: string; value: number } {
  const market = markets.get(marketId);
  if (!market) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (!market.resolved) {
    return { type: 'err', value: 106 }; // err-market-not-resolved
  }
  
  const key = `${marketId}-${caller}`;
  const userStake = marketStakes.get(key);
  if (!userStake) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  
  const winningStake = market.winningOption === 0 ? userStake.option0Stake : userStake.option1Stake;
  const totalWinningStake = Array.from(marketStakes.values())
      .reduce((sum, stake) => sum + (market.winningOption === 0 ? stake.option0Stake : stake.option1Stake), 0);
  
  const payout = Math.floor((winningStake * market.totalStake) / totalWinningStake);
  
  if (payout > 0) {
    marketStakes.set(key, { option0Stake: 0, option1Stake: 0 });
  }
  
  return { type: 'ok', value: payout };
}

describe('Decentralized Prediction Market', () => {
  beforeEach(() => {
    markets.clear();
    marketStakes.clear();
    lastMarketId = 0;
    blockHeight = 1;
  });
  
  it('should allow users to create a market', () => {
    const result = createMarket('wallet1', 'Will feature X be implemented by EOY?', ['Yes', 'No'], 100);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    const market = markets.get(1);
    expect(market).toBeDefined();
    expect(market.description).toBe('Will feature X be implemented by EOY?');
  });
  
  it('should allow users to place bets', () => {
    createMarket('wallet1', 'Will feature X be implemented by EOY?', ['Yes', 'No'], 100);
    const result1 = placeBet('wallet1', 1, 0, 50000000);
    const result2 = placeBet('wallet2', 1, 1, 100000000);
    expect(result1.type).toBe('ok');
    expect(result1.value).toBe(true);
    expect(result2.type).toBe('ok');
    expect(result2.value).toBe(true);
    const market = markets.get(1);
    expect(market.totalStake).toBe(150000000);
  });
  
  it('should only allow the creator to resolve the market', () => {
    createMarket('wallet1', 'Will feature X be implemented by EOY?', ['Yes', 'No'], 10);
    placeBet('wallet1', 1, 0, 50000000);
    placeBet('wallet2', 1, 1, 100000000);
    
    blockHeight = 11;
    
    const result1 = resolveMarket('wallet2', 1, 0);
    const result2 = resolveMarket('wallet1', 1, 0);
    
    expect(result1.type).toBe('err');
    expect(result1.value).toBe(102); // err-unauthorized
    expect(result2.type).toBe('ok');
    expect(result2.value).toBe(true);
  });
});

