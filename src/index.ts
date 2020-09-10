import { MarketMaker } from "./market-maker";

const PERCENT_OF_PORTFOLIO_PER_ROUND = 0.1 // only spend 1% of your balance in an asset per round
const PERCENT_OF_BEST_OFFER = 0.05 // 5% from the best bid price
const INITIAL_ETH = 10 
const INITIAL_USD = 2000 

export const marketMaker = async () => {
  console.log('Market Maker is running');
  const bot = new MarketMaker(INITIAL_ETH, INITIAL_USD, PERCENT_OF_PORTFOLIO_PER_ROUND, PERCENT_OF_BEST_OFFER);

  bot.startMarketMaking();
};
