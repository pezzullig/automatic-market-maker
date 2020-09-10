import { generateNumbersThatSumToTotal, createLog, round } from './helpers';
import { CronJob } from 'cron';
import { DeversifyClient } from './deversify-client';

const NUMBER_OF_BIDS = 5;
const NUMBER_OF_ASKS = 5;

type BidOrAsk = "BID" | "ASK";

interface MakerAction {
  type: BidOrAsk;
  price: number;
  amount: number;
}

export class MarketMaker {
  public balanceETH: number;
  public balanceUSD: number;
  public myBids: MakerAction[] = [];
  public myAsks: MakerAction[] = [];
  public orderBook: number[][] = [[]];
  public cronJob: CronJob | undefined;
  constructor(public initialEth: number, public initialUSD: number, public portfolioSpentPerRound: number, public percentOffBestOffer: number) {
    this.balanceETH = initialEth;
    this.balanceUSD = initialUSD;
    this.portfolioSpentPerRound = portfolioSpentPerRound;
  }

  public startMarketMaking() {
    // creates an array of multiples of 5 up to 55
    const every5Seconds = new Array(11).fill(0).map((_, i) => i * 5);
    const client = new DeversifyClient();
    this.cronJob = new CronJob(`${every5Seconds.join(',')} * * * * *`, async () => {
      createLog('New Round - previous bids & actions cancelled');
      this.orderBook = await client.getOrderBook('tETHUSD', 'P0');
      // FIX_ME: assumes a certain order from the client
      const bestBidPrice = this.orderBook[0][0];
      const bestAskPrice = this.orderBook.find(item => item[2] < 0)![0];
      // create my orders
      this.placeBids(bestBidPrice, NUMBER_OF_BIDS, this.percentOffBestOffer);
      this.placeAsks(bestAskPrice, NUMBER_OF_ASKS, this.percentOffBestOffer);
      // fill possible orders
      this.fillOrders();
      createLog(`Round Finished: ${round(this.balanceETH)} ETH, ${round(this.balanceUSD)} USD`);
    });
    this.cronJob.start();
  }

  public checkBalances = () => {
    if (this.balanceETH < 0) {
      this.cronJob?.stop();
      throw new Error("Negative ETH Balance");
    } else if (this.balanceUSD < 0) {
      this.cronJob?.stop();
      throw new Error("Negative USD Balance");
    }
  };

  public placeBids(bestBid: number, numberOfBids = 5, percentageOffBestOffer = 0.05) {
    createLog(`Best Bid to beat: $${bestBid}`);
    const bids: MakerAction[] = [];
    // i'm buying ETH thus generate 5 random amounts of USD that sum up to portfolioSpentPerRound % of my USD balance
    const randomAmounts = generateNumbersThatSumToTotal(numberOfBids, 3, this.portfolioSpentPerRound * this.balanceUSD);
    for (let i = 0; i < numberOfBids; i += 1) {
      const entropy = Math.random() * (bestBid * percentageOffBestOffer);
      // creates a bid price 5% above the best price
      const bidPrice = bestBid + Math.floor(entropy * 1000) / 1000; // keeps it in 3dp
      const amountInEth = randomAmounts[i] / bidPrice;
      bids.push({
        price: bidPrice,
        amount: amountInEth, // convert amount to be in ETH
        type: "BID"
      });
      console.log(`PLACE BID @ ${round(bidPrice)} ${round(amountInEth)}`);
    }
    // cancels the any orders made in the last round
    this.myBids = [...bids];
  }

  public placeAsks(bestAsk: number, numberOfAsks = 5, percentageOffBestOffer = 0.05) {
    createLog(`Best Ask to beat: $${bestAsk}`);
    const asks: MakerAction[] = [];
    // i'm selling ETH thus generate 5 random amounts of ETH that sum up to portfolioSpentPerRound % of my ETH balance
    const randomAmounts = generateNumbersThatSumToTotal(numberOfAsks, 3, this.portfolioSpentPerRound * this.balanceETH);
    for (let i = 0; i < numberOfAsks; i += 1) {
      const entropy = Math.random() * (bestAsk * percentageOffBestOffer);
      // creates an Ask price 5% below the best price
      const askPrice = bestAsk - Math.floor(entropy * 1000) / 1000; // keeps it in 3dp
      asks.push({
        price: askPrice,
        amount: randomAmounts[i], // amount is in ETH
        type: "ASK"
      });
      console.log(`PLACE ASK @ ${round(askPrice)} ${round(randomAmounts[i])}`);
    }
    // cancels the any orders made in the last round
    this.myAsks = [...asks];
  }

  // iterates through and executes all possible orders
  // partial orders not tracked. ie assume the order is cancelled once it is partially filled
  public fillOrders() {
    createLog("FILLING ORDERS");
    this.orderBook.forEach(order => {
      const [orderPrice, , orderAmountInEth] = order;
      if (orderAmountInEth > 0) {
        // BID 
        const askIndex = this.myAsks.findIndex(ask => ask.price <= orderPrice);
        if (askIndex !== -1) {
          // Found someone that is buying ETH at a higher price then i am selling.
          const askChosen = this.myAsks.splice(askIndex, 1)[0]; // removes from my orders
          const amountToExecuteInEth = Math.min(orderAmountInEth, askChosen.amount);
          const usdGained = amountToExecuteInEth * askChosen.price;
          // execute at the price i quoted
          console.log(`FILLED BID @ ${round(askChosen.price)} ${round(amountToExecuteInEth)} (ETH - ${round(amountToExecuteInEth)} USD + ${round(usdGained)})`);
          this.balanceETH -= amountToExecuteInEth;
          this.balanceUSD += usdGained;
        }
      } else {
        // ASK 
        const myBidIndex = this.myBids.findIndex(bid => bid.price >= orderPrice);
        if (myBidIndex !== -1) {
          // Found someone that is selling ETH at a lower price then i am buying for
          const bidChosen = this.myBids.splice(myBidIndex, 1)[0]; // removes from my orders
          const amountToExecuteInEth = Math.min(-1 * orderAmountInEth, bidChosen.amount);
          const usdLost = amountToExecuteInEth * bidChosen.price;
          // execute at the price i quoted
          console.log(`FILLED ASK @ ${round(bidChosen.price)} ${round(amountToExecuteInEth)} (ETH + ${round(amountToExecuteInEth)} USD - ${round(usdLost)})`);
          this.balanceETH += amountToExecuteInEth;
          this.balanceUSD -= usdLost;
        }
      }
      this.checkBalances();
    });
  }
}
