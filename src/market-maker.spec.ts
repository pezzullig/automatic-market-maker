import { MarketMaker } from "./market-maker";
import { round } from './helpers';

describe("test", () => {
  const ethBid = [100, 1, 1];
  const ethAsk = [100, 1, -1];
  let bot: MarketMaker

  beforeEach(() => {
    bot = new MarketMaker(10, 1000, 0.1, 0); // Note: last two parameters are overridden by the tests
  })

  it("should place one bid for 1 ETH", () => {
    bot.orderBook = [ethBid, ethAsk];
    bot.placeBids(100, 1, 0);
    const myBid = bot.myBids[0];
    expect(myBid.amount).toBe(1);
    expect(myBid.amount).toBe(1);
  });

  it("should place 5 bids summing up to 1 ETH to 2dp", () => {
    bot.orderBook = [ethBid, ethAsk];
    bot.placeBids(100, 5, 0);
    const myBidTotal = bot.myBids.reduce((acc, v) => acc + v.amount, 0);
    expect(round(myBidTotal)).toBe(1);
  });

  it("should place 5 bids with varying bid price to be a total amount less than 1 ETH", () => {
    bot.orderBook = [ethBid, ethAsk];
    bot.placeBids(100, 5, 0.05);
    const myBidTotal = bot.myBids.reduce((acc, v) => acc + v.amount, 0);
    expect(round(myBidTotal)).toBeLessThan(1);
  });

  it("should execute one bid for one ask", () => {
    bot.orderBook = [ethAsk];
    bot.placeBids(100, 1, 0);
    bot.fillOrders();
    expect(bot.balanceETH).toBe(11);
    expect(bot.balanceUSD).toBe(900);
    expect(bot.myBids.length).toBe(0);
  });

  it("should execute one ask for one bid", () => {
    bot.orderBook = [ethBid];
    bot.placeAsks(100, 1, 0);
    bot.fillOrders();
    expect(bot.balanceETH).toBe(9);
    expect(bot.balanceUSD).toBe(1100);
    expect(bot.myAsks.length).toBe(0);
  });

  it("should execute one ask AND one bid", () => {
    bot.orderBook = [ethBid, ethAsk];
    bot.placeAsks(100, 1, 0);
    bot.placeBids(100, 1, 0);
    bot.fillOrders();
    expect(bot.balanceETH).toBe(10);
    expect(bot.balanceUSD).toBe(1000);
    expect(bot.myAsks.length).toBe(0);
  });
});
