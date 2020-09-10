export const generateNumbersThatSumToTotal = (amount: number, dp: number, total = 1): number[] => {
    const numbs = [0, (Math.pow(10, dp)) * total];
    const probs = [];
    for (let i = 0; i < amount - 1; i += 1) {
      numbs.push(Math.floor(Math.random() * Math.pow(10, dp)) * total)
    }
  
    numbs.sort((a, b) => a - b);
    for (let i = 0; i < amount; i += 1) {
      probs.push((numbs[i + 1] - numbs[i]) / (Math.pow(10, dp)));
    }
    return probs;
  };

  export const createLog = (message: string) => {
    console.log(`\n******        ${message}        ******\n`)
  }

export const round = (number: number, decimalPlaces = 2) => Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)