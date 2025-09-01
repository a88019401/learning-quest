import type { Story } from "../types";
import { Card, SectionTitle } from "./ui";


type Props = { story: Story; onRead: () => void };


export default function StoryViewer({ story, onRead }: Props) {
return (
<Card>
<SectionTitle title={`課文：${story.title}`} />
<div className="space-y-3">
{story.paragraphs.map((p, i) => (<p key={i} className="leading-7 text-neutral-800">{p}</p>))}
</div>
<button onClick={onRead} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm mt-4">標記為已閱讀</button>
</Card>
);
}