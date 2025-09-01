import { useState } from "react";import { Card, SectionTitle } from "./ui";
import { shuffle } from "../lib/questionGen";


type Props = { sentences: string[]; onFinished: (score: number) => void };


export default function ArrangeSentencesGame({ sentences, onFinished }: Props) {
const target = sentences;
const [list, setList] = useState<string[]>(() => shuffle(target));
function move(i: number, dir: -1 | 1) { const j = i + dir; if (j < 0 || j >= list.length) return; const a = [...list]; [a[i], a[j]] = [a[j], a[i]]; setList(a); }
function finish() { const correct = list.filter((s, i) => s === target[i]).length; onFinished(correct); }


return (
<Card>
<SectionTitle title="句型排列小遊戲" desc="使用↑↓調整順序，完全正確可拿滿分" />
<ul className="space-y-2">
{list.map((s, i) => (
<li key={i} className="flex items-center gap-2">
<div className="flex-1 p-3 rounded-xl border bg-neutral-50">{i + 1}. {s}</div>
<div className="flex flex-col gap-1">
<button onClick={() => move(i, -1)} className="px-2 py-1 rounded-lg border bg-white">↑</button>
<button onClick={() => move(i, +1)} className="px-2 py-1 rounded-lg border bg-white">↓</button>
</div>
</li>
))}
</ul>
<button onClick={finish} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm mt-3">完成並計分</button>
</Card>
);
}