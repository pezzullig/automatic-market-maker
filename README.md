# Market Maker
a simple proof of concept bot for market making using the Deversify API

# Running the bot
* `git clone repository`
* `npm i`
* `yarn start` - ignore the TypeScript error: `Failed to load tsconfig.json: Missing baseUrl in compilerOptions`

The bot will execute every 5 seconds as follows:

* round starts
* fetch the latest markets orders using Deversify API
* create the bids given the latest market orders
* create the asks given the latest market orders
* fill orders by iterating through the market orders and finding a match with the created orders
* display remaining balance 
* round ends

## Improvements
* orders are not partially filled, i.e. once an order is partially filled, the remainder is cancelled
* matching asks with bids is done randomly, i.e. it should pick the bid which is closest to the ask and vice versa

## Initial Conditions
in [maket-maker.ts](./src/index.ts) you can change:
* initial ETH balance
* initial USD balance
* percentage of your portfolio that you would like to spend per round
  * a value of `0.1` will spend a maximum of 0.1% of your ETH and 0.1% of your USD
* percentOffBestOffer - how far you will vary from the current best offer on the market (in percentage)

# Run tests

* `yarn test`
