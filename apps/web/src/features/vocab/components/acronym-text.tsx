type AcronymTextProps = {
  /** 正式名称のスペルアウト。 */
  full: string;
  /** full のうち、略語の 1 文字になっている位置。 */
  acronym: number[];
};

type Run = { text: string; head: boolean; at: number };

/** 隣り合う同じ扱いの文字をまとめて、描く単位にする。 */
const runsOf = (full: string, acronym: number[]): Run[] => {
  const heads = new Set(acronym);
  const runs: Run[] = [];
  for (const [index, char] of [...full].entries()) {
    const head = heads.has(index);
    const last = runs.at(-1);
    if (last && last.head === head) last.text += char;
    else runs.push({ text: char, head, at: index });
  }
  return runs;
};

/** 正式名称を出す。略語の 1 文字になっている字だけ色と太さを変える。 */
export const AcronymText = ({ full, acronym }: AcronymTextProps) => {
  return (
    <span>
      {runsOf(full, acronym).map((run) => (
        <span
          // 同じ綴りが何度も出るので、full の中の位置で見分ける。
          key={run.at}
          className={run.head ? "font-bold text-accent" : undefined}
        >
          {run.text}
        </span>
      ))}
    </span>
  );
};
