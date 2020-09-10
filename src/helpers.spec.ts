import { generateNumbersThatSumToTotal, round } from './helpers';
describe("random numbers", () => {
  it("should create random numbers summing to 1", () => {
    const [a, b] = generateNumbersThatSumToTotal(2, 3, 1);
    expect(a + b).toBe(1);
  });

  it("should create 10 random numbers summing to 100", () => {
    const numbs = generateNumbersThatSumToTotal(10, 3, 100);
    console.log(numbs);
    expect(round(numbs.reduce((acc, v) => acc + v))).toBe(100);
  });
});
