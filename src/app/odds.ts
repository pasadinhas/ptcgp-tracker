import A1 from "../data/A1.json";
import { Card, OwnedCards, PackOddsSetA1, RarityMap, SetData } from "./types";
import Constants from "./constants"

interface PackDefinition {
  [rarity: string]: Card[];
}

function getRandomElement<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

interface WeightedChoice {
  value: string;
  weight: number;
}
function weightedRandomSelect(choices: WeightedChoice[]): string {
  const sumOfWeights = choices.reduce((sum, choice) => sum + choice.weight, 0);

  if (sumOfWeights < 1 || sumOfWeights > 1.0001) {
    throw new Error(`Total probability must equal 1, but got ${sumOfWeights}`);
  }

  let random = Math.random();
  for (let i = 0; i < choices.length; i++) {
    const { value, weight } = choices[i];
    if (random < weight) {
      return value;
    }
    random -= weight;
  }
  return choices[choices.length - 1].value;
}

function createPackDefinition(data: SetData, pack: string): PackDefinition {
  return data
    .filter((card) => card.pack == pack || card.pack == Constants.A1_PACK_ANY)
    .reduce((result: PackDefinition, card: Card) => {
      if (!result[card.rarity]) {
        result[card.rarity] = [];
      }
      result[card.rarity].push(card);
      return result;
    }, {});
}

const REGULAR_PACK_CARD_1_ODDS = [{ value: Constants.RARITY_REGULAR_1, weight: 1 }];
const REGULAR_PACK_CARD_2_ODDS = REGULAR_PACK_CARD_1_ODDS;
const REGULAR_PACK_CARD_3_ODDS = REGULAR_PACK_CARD_1_ODDS;
const REGULAR_PACK_CARD_4_ODDS = [
  { value: Constants.RARITY_REGULAR_2, weight: 0.90_000 },
  { value: Constants.RARITY_REGULAR_3, weight: 0.05_000 },
  { value: Constants.RARITY_REGULAR_4, weight: 0.01_666 },
  { value: Constants.RARITY_STAR_1, weight: 0.02_573 },
  { value: Constants.RARITY_STAR_2, weight: 0.00_500 },
  { value: Constants.RARITY_STAR_3, weight: 0.00_222 },
  { value: Constants.RARITY_CROWN, weight: 0.00_040 },
];
const REGULAR_PACK_CARD_5_ODDS = [
  { value: Constants.RARITY_REGULAR_2, weight: 0.60_000 },
  { value: Constants.RARITY_REGULAR_3, weight: 0.20_000 },
  { value: Constants.RARITY_REGULAR_4, weight: 0.06_664 },
  { value: Constants.RARITY_STAR_1, weight: 0.10_288 },
  { value: Constants.RARITY_STAR_2, weight: 0.02_000 },
  { value: Constants.RARITY_STAR_3, weight: 0.00_888 },
  { value: Constants.RARITY_CROWN, weight: 0.00_160 },
];

function rollRegularPack(pack_definition: PackDefinition) {
  const card_1_rarity = weightedRandomSelect(REGULAR_PACK_CARD_1_ODDS);
  const card_2_rarity = weightedRandomSelect(REGULAR_PACK_CARD_2_ODDS);
  const card_3_rarity = weightedRandomSelect(REGULAR_PACK_CARD_3_ODDS);
  const card_4_rarity = weightedRandomSelect(REGULAR_PACK_CARD_4_ODDS);
  const card_5_rarity = weightedRandomSelect(REGULAR_PACK_CARD_5_ODDS);

  return [
    getRandomElement(pack_definition[card_1_rarity]),
    getRandomElement(pack_definition[card_2_rarity]),
    getRandomElement(pack_definition[card_3_rarity]),
    getRandomElement(pack_definition[card_4_rarity]),
    getRandomElement(pack_definition[card_5_rarity]),
  ];
}

// The dataset and owned cards use different ID formats.
function idMapper(id: string): string {
  return (id.match(/^A1 0*(\d+)$/) || [])[1];
}

const RARITY_MAP_ZERO_INIT: RarityMap = Object.freeze({
  [Constants.RARITY_REGULAR_1]: 0,
  [Constants.RARITY_REGULAR_2]: 0,
  [Constants.RARITY_REGULAR_3]: 0,
  [Constants.RARITY_REGULAR_4]: 0,
  [Constants.RARITY_STAR_1]: 0,
  [Constants.RARITY_STAR_2]: 0,
  [Constants.RARITY_STAR_3]: 0,
  [Constants.RARITY_CROWN]: 0,
  [Constants.RARITY_ANY]: 0,
});

function regularPackOdds(pack_definition: PackDefinition, ownedCards: OwnedCards, rolls: number) {
  const newCardsCount: RarityMap = { ...RARITY_MAP_ZERO_INIT };
  const newRaritiesCount: RarityMap = { ...RARITY_MAP_ZERO_INIT };

  for (let i = 0; i < rolls; ++i) {
    const pack = rollRegularPack(pack_definition);

    const packedIds = new Set<string>();
    const packedRarities = new Set<string>();

    const newCards = pack.filter((card) => !(ownedCards.A1[idMapper(card.id)] || packedIds.has(card.id)) && packedIds.add(card.id));

    newCards.forEach((card) => {
      newCardsCount[card.rarity] += 1;
      newCardsCount[Constants.RARITY_ANY] += 1;
      packedRarities.add(card.rarity);
    });

    packedRarities.forEach((rarity) => {
      newRaritiesCount[rarity] += 1;
    });
    if (newCards.length > 0) {
      newRaritiesCount[Constants.RARITY_ANY] += 1;
    }
  }

  const newCardsAmountPerPack = { ...RARITY_MAP_ZERO_INIT };
  const newCardsProbabilityPerPack = { ...RARITY_MAP_ZERO_INIT };
  const packsUntilFirstNewCard = { ...RARITY_MAP_ZERO_INIT };

  Object.entries(newCardsCount).forEach(([rarity, count]) => (newCardsAmountPerPack[rarity] = count / rolls));
  Object.entries(newRaritiesCount).forEach(([rarity, count]) => (newCardsProbabilityPerPack[rarity] = count / rolls));
  Object.entries(newCardsProbabilityPerPack).forEach(
    ([rarity, probability]) => (packsUntilFirstNewCard[rarity] = Math.round(100 / probability) / 100)
  );

  return {
    newCardsAmount: newCardsAmountPerPack,
    newCardsProbability: newCardsProbabilityPerPack,
    packsUntilFirstNewCard: packsUntilFirstNewCard,
  };
}

const A1_PACK_MEWTWO_DEFINITION = createPackDefinition(A1, Constants.A1_PACK_MEWTWO);
const A1_PACK_PIKACHU_DEFINITION = createPackDefinition(A1, Constants.A1_PACK_PIKACHU);
const A1_PACK_CHARIZARD_DEFINITION = createPackDefinition(A1, Constants.A1_PACK_CHARIZARD);

export default function odds(ownedCards: OwnedCards, rolls: number = 100_000): PackOddsSetA1 {
  return {
    mewtwo: regularPackOdds(A1_PACK_MEWTWO_DEFINITION, ownedCards, rolls),
    pikachu: regularPackOdds(A1_PACK_PIKACHU_DEFINITION, ownedCards, rolls),
    charizard: regularPackOdds(A1_PACK_CHARIZARD_DEFINITION, ownedCards, rolls),
  };
}
