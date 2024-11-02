"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_OWNED_CARDS_KEY = "pkmn-tcgp-tracker.owned-cards";

interface OwnedCards {
  A1: SetOwnedCards;
}

interface SetOwnedCards {
  [id: string]: number;
}

export default function Home() {
  const [ownedCards, setOwnedCards] = useState<OwnedCards>({ A1: {} });

  useEffect(() => {
    const storedOwnedCards = localStorage.getItem(
      LOCAL_STORAGE_OWNED_CARDS_KEY
    );
    if (storedOwnedCards != null) {
      setOwnedCards(JSON.parse(storedOwnedCards));
    }
  }, []);

  const saveOwnedCards = (newOwnedCards: OwnedCards) => {
    setOwnedCards({ ...newOwnedCards });
    localStorage.setItem(
      LOCAL_STORAGE_OWNED_CARDS_KEY,
      JSON.stringify(newOwnedCards)
    );
  };

  return (
    <div className="p-10">
      <div className="grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 grid-rows-auto auto-cols-min gap-x-5 gap-y-5">
        {Array.from({ length: 286 }, (_, i) => `${i + 1}`).map((id) => (
          <DexItem
            key={`A1_${id}`}
            id={id}
            amount={ownedCards.A1[id] || 0}
            increaseQuantity={() => {
              ownedCards.A1[id] = (ownedCards.A1[id] || 0) + 1;
              console.log(ownedCards.A1);
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
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
}

function DexItem({
  id,
  amount,
  increaseQuantity,
  decreaseQuantity,
}: DexItemProps) {
  return (
    <div className="grid justify-center gap-3 shadow-xl bg-slate-300 p-3 rounded-lg">
      <div className="flex justify-center gap-3 relative">
        {[
          ["mewtwo"],
          ["pikachu"],
          ["charizard"],
          ["mewtwo", "pikachu", "charizard"],
        ][Math.floor(Math.random() * 4)].map((pack) => (
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
        className={`shadow-lg rounded-lg ${
          amount == 0 && "brightness-50 grayscale-[50%]"
        }`}
      ></Image>
      <div className="flex justify-center select-none">
        <span
          className="rounded-l-lg bg-slate-400 px-5 py-1 cursor-pointer hover:bg-slate-500 active:bg-slate-600"
          onClick={decreaseQuantity}
        >
          -
        </span>
        <span className="bg-slate-300 px-5 py-1">{amount}</span>
        <span
          className="rounded-r-lg bg-slate-400 px-5 py-1 cursor-pointer hover:bg-slate-500 active:bg-slate-600"
          onClick={increaseQuantity}
        >
          +
        </span>
      </div>
    </div>
  );
}
