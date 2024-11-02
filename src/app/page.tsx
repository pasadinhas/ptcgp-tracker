import Image from "next/image";

export default function Home() {
  return (
    <div className="p-10">
      <div className="grid grid-cols-8 gap-x-5 gap-y-5">
        {Array.from({ length: 286 }, (_, i) => i + 1).map((i) => (
          <DexItem number={i} amount={[0,1,2][Math.floor(Math.random() * 3)]} />
        ))}
      </div>
    </div>
  );
}

function DexItem({ number, amount }: { number: number, amount: number }) {
  return (
    <div className="grid justify-center gap-3 shadow-xl bg-slate-200 p-3 rounded-lg">
      <Image
        src={`/static/pokemon/cards/A1/${number}.png`}
        alt="Some pokemon card..."
        width={294}
        height={410}
        className={`shadow-lg rounded-lg ${amount == 0 && "brightness-50 grayscale-[50%]"}`}
      ></Image>
      <div className="flex justify-center">
        <span className="rounded-l-lg bg-slate-300 px-5 py-1">-</span>
        <span className="bg-slate-200 px-5 py-1">{amount}</span>
        <span className="rounded-r-lg bg-slate-300 px-5 py-1">+</span>
      </div>
    </div>
  );
}
