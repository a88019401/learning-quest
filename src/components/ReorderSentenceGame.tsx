import { useMemo, useState } from "react";
import { Card } from "./ui";
import { shuffle } from "../lib/questionGen";


type Props = { target: string; onFinished: (ok: boolean) => void };


export default function ReorderSentenceGame({ target, onFinished }: Props) {
const tokens = useMemo(() => target.replace(/[.?!]$/, "").split(" "), [target]);
const [pool, setPool] = useState<string[]>(() => shuffle(tokens));
const [built, setBuilt] = useState<string[]>([]);


function pick(i: number) { const t = pool[i]; setPool((p) => p.filter((_, k) => k !== i)); setBuilt((b) => [...b, t]); }
function undo(i: number) { const t = built[i]; setBuilt((b) => b.filter((_, k) => k !== i)); setPool((p) => [...p, t]); }
function check() { const ok = built.join(" ") === tokens.join(" "); onFinished(ok); }


return (
<Card>
<div className="text-sm text-neutral-500 mb-2">請依正確順序點擊組合句子：</div>
<div className="flex flex-wrap gap-2 mb-3">
{pool.map((t, i) => (
<button key={i} onClick={() => pick(i)} className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-sm">{t}</button>
))}
</div>
<div className="p-3 rounded-xl bg-white border border-neutral-200 min-h-[48px] flex flex-wrap gap-2 mb-3">
{built.map((t, i) => (
<button key={i} onClick={() => undo(i)} className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm">{t}</button>
))}
</div>
<button onClick={check} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm">完成並檢查</button>
</Card>
);
}