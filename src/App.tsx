import React, { useState } from "react";
import { UNITS } from "./data/units";
import type { UnitConfig, UnitId } from "./types";
import { useProgress } from "./state/progress";

import { TabButton, Card, SectionTitle } from "./components/ui";
import VocabSet from "./components/VocabSet";
import VocabQuiz from "./components/VocabQuiz";
import GrammarExplain from "./components/GrammarExplain";
import ReorderSentenceGame from "./components/ReorderSentenceGame";
import StoryViewer from "./components/StoryViewer";
import ArrangeSentencesGame from "./components/ArrangeSentencesGame";
import ChallengeRun from "./components/ChallengeRun";
import BadgesView from "./components/BadgesView";
import { makeVocabMCQ } from "./lib/questionGen";

type Tab = "learn" | "challenge" | "badges";
type LearnSubTab = "vocab" | "grammar" | "text";
type VocabView = "set" | "quiz";
type GrammarView = "explain" | "reorder";
type TextView = "story" | "arrange";

export default function App() {
  // 頁籤 / 視圖狀態
  const [tab, setTab] = useState<Tab>("learn");
  const [unitId, setUnitId] = useState<UnitId>(1);
  const [sub, setSub] = useState<LearnSubTab>("vocab");
  const [vocabView, setVocabView] = useState<VocabView>("set");
  const [grammarView, setGrammarView] = useState<GrammarView>("explain");
  const [textView, setTextView] = useState<TextView>("story");

  // 資料與進度
  const unit: UnitConfig = UNITS.find((u) => u.id === unitId)!;
  const { progress, addXP, patchUnit, awardBadge, reset } = useProgress();
  const uProg = progress.byUnit[unitId];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight">LearningQuest</div>
          <div className="text-sm text-neutral-500">可模組化英語學習 · 6 單元 · 遊戲化</div>
        </div>
        <div className="flex items-center gap-2">
          <TabButton active={tab === "learn"} onClick={() => setTab("learn")}>
            學習區
          </TabButton>
          <TabButton active={tab === "challenge"} onClick={() => setTab("challenge")}>
            挑戰區
          </TabButton>
          <TabButton active={tab === "badges"} onClick={() => setTab("badges")}>
            獎章區
          </TabButton>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10">
        {/* HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Card>
            <div className="text-sm text-neutral-500">目前單元</div>
            <div className="text-lg font-semibold">{unit.title}</div>
            <div className="mt-2 text-sm">
              星等：{"⭐".repeat(uProg.stars)}
              {"☆".repeat(3 - uProg.stars)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-500">本單元 XP</div>
            <div className="text-2xl font-bold">{uProg.xp}</div>
            <div className="text-sm text-neutral-500">總 XP：{progress.totalXP}</div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-500">快捷</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={reset}
                className="px-3 py-2 rounded-xl border text-sm"
              >
                重置進度
              </button>
              <button
                onClick={() =>
                  alert("請在 data/units.ts 中替換成你的題庫即可擴充 6 單元。")
                }
                className="px-3 py-2 rounded-xl border text-sm"
              >
                如何擴充？
              </button>
            </div>
          </Card>
        </div>

        {/* 單元選擇 */}
        <Card>
          <SectionTitle title="選擇單元 (共 6)" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {UNITS.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnitId(u.id)}
                className={`p-3 rounded-xl border text-left ${
                  u.id === unitId
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white hover:bg-neutral-50"
                }`}
              >
                <div className="text-xs opacity-80">Unit {u.id}</div>
                <div className="font-semibold truncate">
                  {u.title.replace(/^Unit \d+:\s*/, "")}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 主區域 */}
        <div className="mt-4 space-y-4">
          {tab === "learn" && (
            <>
              {/* 子分頁切換 */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TabButton active={sub === "vocab"} onClick={() => setSub("vocab")}>
                    1. 單字
                  </TabButton>
                  <TabButton active={sub === "grammar"} onClick={() => setSub("grammar")}>
                    2. 文法
                  </TabButton>
                  <TabButton active={sub === "text"} onClick={() => setSub("text")}>
                    3. 課文
                  </TabButton>
                </div>

                {sub === "vocab" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={vocabView === "set"}
                      onClick={() => setVocabView("set")}
                    >
                      單字集
                    </TabButton>
                    <TabButton
                      active={vocabView === "quiz"}
                      onClick={() => setVocabView("quiz")}
                    >
                      4 選 1 小遊戲
                    </TabButton>
                  </div>
                )}

                {sub === "grammar" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={grammarView === "explain"}
                      onClick={() => setGrammarView("explain")}
                    >
                      文法說明
                    </TabButton>
                    <TabButton
                      active={grammarView === "reorder"}
                      onClick={() => setGrammarView("reorder")}
                    >
                      重組句子
                    </TabButton>
                  </div>
                )}

                {sub === "text" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={textView === "story"}
                      onClick={() => setTextView("story")}
                    >
                      課文故事
                    </TabButton>
                    <TabButton
                      active={textView === "arrange"}
                      onClick={() => setTextView("arrange")}
                    >
                      句型排列
                    </TabButton>
                  </div>
                )}
              </Card>

              {/* 內容：單字 */}
              {sub === "vocab" &&
                (vocabView === "set" ? (
                  <VocabSet
                    title={`${unit.title} 單字集`}
                    words={unit.words}
                    onStudied={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          studied: uProg.vocab.studied + 1,
                        },
                      });
                    }}
                  />
                ) : (
                  <VocabQuiz
                    questions={makeVocabMCQ(unit, 8)}
                    onFinished={(score) => {
                      addXP(unitId, score);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          quizBest: Math.max(uProg.vocab.quizBest, score),
                        },
                      });
                    }}
                  />
                ))}

              {/* 內容：文法 */}
              {sub === "grammar" &&
                (grammarView === "explain" ? (
                  <GrammarExplain
                    points={unit.grammar}
                    onStudied={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        grammar: {
                          ...uProg.grammar,
                          studied: uProg.grammar.studied + 1,
                        },
                      });
                    }}
                  />
                ) : (
                  <ReorderSentenceGame
                    target={unit.grammar[0]?.examples[0] ?? "I am a student."}
                    onFinished={(ok) => {
                      addXP(unitId, ok ? 5 : 2);
                      patchUnit(unitId, {
                        grammar: {
                          ...uProg.grammar,
                          reorderBest: Math.max(uProg.grammar.reorderBest, ok ? 1 : 0),
                        },
                      });
                    }}
                  />
                ))}

              {/* 內容：課文 */}
              {sub === "text" &&
                (textView === "story" ? (
                  <StoryViewer
                    story={unit.story}
                    onRead={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        text: { ...uProg.text, read: uProg.text.read + 1 },
                      });
                    }}
                  />
                ) : (
                  <ArrangeSentencesGame
                    sentences={unit.story.sentencesForArrange}
                    onFinished={(correct) => {
                      addXP(unitId, correct);
                      patchUnit(unitId, {
                        text: {
                          ...uProg.text,
                          arrangeBest: Math.max(uProg.text.arrangeBest, correct),
                        },
                      });
                    }}
                  />
                ))}
            </>
          )}

          {/* 挑戰區 */}
          {tab === "challenge" && (
            <ChallengeRun
              unit={unit}
              onFinish={(score, timeUsed) => {
                const bestScore = Math.max(uProg.challenge.bestScore, score);
                const bestTime =
                  uProg.challenge.bestTimeSec === 0
                    ? timeUsed
                    : Math.min(uProg.challenge.bestTimeSec, timeUsed);

                addXP(unitId, score * 2);
                patchUnit(unitId, {
                  challenge: {
                    clearedLevels: uProg.challenge.clearedLevels + 1,
                    bestTimeSec: bestTime,
                    bestScore,
                  },
                });

                if (score === 10) awardBadge("PERFECT_10");
                if (timeUsed <= 40) awardBadge("SPEEDSTER");

                alert(`挑戰完成！\n得分：${score}/10\n用時：${timeUsed}s`);
              }}
            />
          )}

          {/* 獎章區 */}
          {tab === "badges" && <BadgesView progress={progress} />}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} LearningQuest · 可自由調整的模組化原型
      </footer>
    </div>
  );
}
