import fetch from 'node-fetch';

export class DeversifyClient {
  public async getOrderBook(symbol = "tETHUSD", precision = "P0") {
    const url = `https://api.stg.deversifi.com/bfx/v2/book/${symbol}/${precision}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
}