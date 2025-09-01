import React from "react";
import type { Progress } from "../state/progress";
import { Card, SectionTitle } from "./ui";


export const BADGE_META: Record<string, { name: string; desc: string }> = {
FIRST_STEPS: { name: "新手啟程", desc: "在任一單元標記過學習進度" },
VOCAB_NOVICE: { name: "單字入門", desc: "單字小測達成 6 分以上" },
GRAMMAR_APPRENTICE: { name: "文法學徒", desc: "完成一次重組句子遊戲" },
STORY_EXPLORER: { name: "故事探險", desc: "閱讀任一課文一次" },
SPEEDSTER: { name: "神速挑戰", desc: "挑戰區 40 秒內完成一次" },
PERFECT_10: { name: "滿分王者", desc: "挑戰區拿到 10/10" },
UNIT_MASTER: { name: "單元大師", desc: "任一單元星等達到 3 星" },
};


type Props = { progress: Progress };


export default function BadgesView({ progress }: Props) {
return (
<Card>
<SectionTitle title="獎章一覽" desc="依據學習/挑戰表現自動解鎖" />
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
{Object.entries(BADGE_META).map(([key, meta]) => {
const unlocked = progress.badges[key]?.unlocked;
return (
<div key={key} className={`p-3 rounded-2xl border ${unlocked ? "bg-white" : "bg-neutral-100 opacity-80"}`}>
<div className="text-2xl">{unlocked ? "🏅" : "🔒"}</div>
<div className="font-semibold mt-1">{meta.name}</div>
<div className="text-sm text-neutral-600">{meta.desc}</div>
{unlocked && progress.badges[key]?.unlockedAt && (
<div className="text-xs text-neutral-400 mt-1">解鎖於 {new Date(progress.badges[key]!.unlockedAt!).toLocaleString()}</div>
)}
</div>
);
})}
</div>
</Card>
);
}