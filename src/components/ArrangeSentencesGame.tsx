import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./ui";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,              // ← 用插入排序的關鍵！
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = { sentences: string[]; onFinished: (score: number) => void };
type Row = { id: string; text: string };

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SortableRow({
  item,
  index,
  correct,
}: {
  item: Row;
  index: number;
  correct: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",           // 桌機觸控板／手機手勢都能拖
  };

  const colorBox = correct
    ? "border-green-400 bg-green-50 text-green-900"
    : "border-red-300 bg-red-50 text-red-800";

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}               // 整列可拖
      className={`flex items-center gap-2 cursor-grab select-none ${
        isDragging ? "opacity-70" : ""
      }`}
      aria-roledescription="sortable item"
    >
      <div className={`flex-1 p-3 rounded-xl border transition-all duration-150 ${colorBox}`}>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500" aria-hidden>≡</span>
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
              correct ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
            aria-label={correct ? "正確" : "錯誤"}
            title={correct ? "正確" : "錯誤"}
          >
            {correct ? "✓" : "✗"}
          </span>
          <span className="opacity-70">{index + 1}.</span>
          <span>{item.text}</span>
        </div>
      </div>
    </li>
  );
}

export default function ArrangeSentencesGame({ sentences, onFinished }: Props) {
  const target = useMemo(() => sentences, [sentences]);
  const targetRows = useMemo<Row[]>(
    () => target.map((text, idx) => ({ id: `s-${idx}`, text })),
    [target]
  );
  const [list, setList] = useState<Row[]>(() => fisherYates(targetRows));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const isCorrectAt = (idx: number) => list[idx]?.text === target[idx];

  // ✅ 插入式排序：拖到哪就放在哪，其他行跟著讓位
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setList((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === String(active.id));
      const newIndex = prev.findIndex((x) => x.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const finish = () => {
    const correct = list.filter((r, i) => r.text === target[i]).length;
    onFinished(correct);
  };

  return (
    <Card>
      <SectionTitle
        title="句型排列小遊戲（拖曳排序｜手機/電腦支援）"
        desc="拖到目標位置放開：正確亮綠、錯誤亮紅；完全正確可拿滿分"
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={list.map((x) => x.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {list.map((row, i) => (
              <SortableRow key={row.id} item={row} index={i} correct={isCorrectAt(i)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button
        onClick={finish}
        className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm mt-3"
      >
        完成並計分
      </button>
    </Card>
  );
}
