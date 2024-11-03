"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { OwnedCards, PackOdds, CardsMap, Card } from "./types";
import odds from "./odds";
import A1 from "../data/A1.json"
import Constants from "./constants";

const LOCAL_STORAGE_OWNED_CARDS_KEY = "pkmn-tcgp-tracker.owned-cards";

const A1_CARDS_MAP: CardsMap = A1.reduce((map: CardsMap, card: Card) => {
  map[(card.id.match(/^A1 0*(\d+)$/) || [])[1]] = card
  return map
}, {})

export default function Home() {
  const [ownedCards, setOwnedCards] = useState<OwnedCards>({ A1: {} });

  useEffect(() => {
    const storedOwnedCards = localStorage.getItem(LOCAL_STORAGE_OWNED_CARDS_KEY);
    if (storedOwnedCards != null) {
      setOwnedCards(JSON.parse(storedOwnedCards));
    }
  }, []);

  const saveOwnedCards = (newOwnedCards: OwnedCards) => {
    setOwnedCards({ ...newOwnedCards });
    localStorage.setItem(LOCAL_STORAGE_OWNED_CARDS_KEY, JSON.stringify(newOwnedCards));
  };

  return (
    <div className="p-10">
      <div>
        <PackOddsGrid ownedCards={ownedCards} />
      </div>
      <div className="grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 grid-rows-auto auto-cols-min gap-x-5 gap-y-5">
        {Array.from({ length: 286 }, (_, i) => `${i + 1}`).map((id) => (
          <DexItem
            key={`A1_${id}`}
            id={id}
            amount={ownedCards.A1[id] || 0}
            card={A1_CARDS_MAP[id]}
            increaseQuantity={() => {
              ownedCards.A1[id] = (ownedCards.A1[id] || 0) + 1;
              saveOwnedCards(ownedCards);
            }}
            decreaseQuantity={() => {
              ownedCards.A1[id] = Math.max(0, (ownedCards.A1[id] || 0) - 1);
              saveOwnedCards(ownedCards);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface DexItemProps {
  id: string;
  amount: number;
  card: Card;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
}

function DexItem({ id, amount, card, increaseQuantity, decreaseQuantity }: DexItemProps) {  
  const packs = ({
    [Constants.A1_PACK_MEWTWO]: ["mewtwo"],
    [Constants.A1_PACK_PIKACHU]: ["pikachu"],
    [Constants.A1_PACK_CHARIZARD]: ["charizard"],
    [Constants.A1_PACK_SPECIAL]: [],
    [Constants.A1_PACK_ANY]: ["mewtwo", "pikachu", "charizard"],

  })[card.pack]
  return (
    <div className="grid justify-center gap-3 shadow-xl bg-slate-300 p-3 rounded-lg">
      <div className="flex justify-center gap-3 relative">
        {packs.map((pack) => (
          <Image
            key={`card_A1_${id}_pack_${pack}`}
            src={`/ptcgp-tracker/static/pokemon/sets/A1/packs/${pack}.png`}
            alt="Pack"
            width={80}
            height={29}
            className="w-1/4"
          />
        ))}
      </div>
      <Image
        src={`/ptcgp-tracker/static/pokemon/sets/A1/cards/${id}.png`}
        alt="Some pokemon card..."
        width={294}
        height={410}
        className={`shadow-lg rounded-lg ${amount == 0 && "brightness-50 grayscale-[50%]"}`}
      ></Image>
      <div className="flex justify-center select-none">
        <span className="rounded-l-lg bg-slate-400 px-5 py-1 cursor-pointer hover:bg-slate-500 active:bg-slate-600" onClick={decreaseQuantity}>
          -
        </span>
        <span className="bg-slate-300 px-5 py-1">{amount}</span>
        <span className="rounded-r-lg bg-slate-400 px-5 py-1 cursor-pointer hover:bg-slate-500 active:bg-slate-600" onClick={increaseQuantity}>
          +
        </span>
      </div>
    </div>
  );
}

//
// Pack Odds
//

function PackOddsGrid({ ownedCards }: { ownedCards: OwnedCards }) {
  const packsOdds = useMemo(() => odds(ownedCards), [ownedCards]);

  return (
    <div className="grid grid-cols-10 mb-10">
      <span>Pack</span>
      {Object.keys(packsOdds.mewtwo.packsUntilFirstNewCard).map((rarity) => (
        <span key={rarity}>{rarity}</span>
      ))}
      {Object.entries(packsOdds).flatMap(([packName, pOdds]: [string, PackOdds]) => [
        <span key={`odds-${packName}`}>{packName}</span>,
        ...Object.values(pOdds.packsUntilFirstNewCard).map((odd, i) => <span key={`odds-${packName}-${i}`}>{odd}</span>),
      ])}
    </div>
  );
}
