export interface OwnedCards {
  A1: SetOwnedCards;
}

export interface SetOwnedCards {
  [id: string]: number;
}

export interface RarityMap {
  [rarity: string]: number;
}

export interface PackOdds {
  newCardsProbability: RarityMap;
  newCardsAmount: RarityMap;
  packsUntilFirstNewCard: RarityMap;
}

export interface PackOddsSetA1 {
  mewtwo: PackOdds;
  pikachu: PackOdds;
  charizard: PackOdds;
}

import A1 from "../data/A1.json"
export type SetData = typeof A1;
export type Card = SetData[0];

export interface CardsMap {
  [id: string]: Card
}