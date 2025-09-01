import React, { useState } from "react";
import type { Word } from "../types";
import { Card, SectionTitle } from "./ui";


type Props = { title?: string; words: Word[]; onStudied: () => void };


export default function VocabSet({ title = "單字集", words, onStudied }: Props) {
const [revealed, setRevealed] = useState<Record<number, boolean>>({});
return (
<Card>
<SectionTitle title={title} desc="點擊卡片可翻面（中⇄英）" />
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
{words.map((w, idx) => {
const isFront = !revealed[idx];
return (
<button key={idx} onClick={() => setRevealed((r) => ({ ...r, [idx]: !r[idx] }))}
className="h-28 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 p-3 text-left transition">
<div className="text-sm text-neutral-500 mb-1">#{idx + 1}</div>
<div className="text-xl font-semibold">{isFront ? w.def : w.term}</div>
{!isFront && w.example && (<div className="text-xs text-neutral-500 mt-2">{w.example}</div>)}
</button>
);
})}
</div>
<div className="mt-4">
<button onClick={onStudied} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm">標記為已學習</button>
</div>
</Card>
);
}