import type { Marks, TextBlock } from "../types";

/** 本文中の空欄（`{{a}}`）。 */
const BLANK = /(\{\{[^}]+\}\})/;

/** 本文の文字列。空欄は枠にし、答え合わせの後は正誤で色を付ける。 */
export const DrillText = ({ text, marks }: { text: string; marks: Marks }) => (
  <>
    {text.split(BLANK).map((piece, i) => {
      const key = `${i}-${piece}`;
      if (!(piece.startsWith("{{") && piece.endsWith("}}"))) return <span key={key}>{piece}</span>;
      const name = piece.slice(2, -2);
      const mark = marks?.[name];
      return (
        <span
          key={key}
          role="img"
          aria-label={
            mark === undefined ? `空欄${name}` : `空欄${name}（${mark ? "正解" : "不正解"}）`
          }
          className={`mx-0.5 inline-block min-w-[2.6em] border px-1.5 text-center font-bold font-sans leading-[1.5] ${
            mark === undefined
              ? "border-ink"
              : mark
                ? "border-ok-line bg-ok-bg text-ok"
                : "border-ng-line bg-ng-bg text-ng"
          }`}
        >
          {name}
        </span>
      );
    })}
  </>
);

export const PARAGRAPH = "text-pretty text-read-md text-ink-soft leading-[1.95]";

/** 段落・表・等幅の行。どのドリルでも同じ見た目で組む。 */
export const TextBlockView = ({ block, marks }: { block: TextBlock; marks: Marks }) => {
  switch (block.kind) {
    case "p":
      return (
        <p className={`${PARAGRAPH} indent-[1em]`}>
          <DrillText text={block.text} marks={marks} />
        </p>
      );
    case "code":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <pre className="overflow-x-auto rounded-md border border-edge bg-panel px-4 py-3 font-mono text-ink-soft text-read-sm leading-[2.1]">
            {block.lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 行は静的で並べ替えず、同じ行が並ぶこともある
              <span key={i} className="block min-h-[1lh] whitespace-pre">
                <DrillText text={line} marks={marks} />
              </span>
            ))}
          </pre>
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
        </figure>
      );
    case "table":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-read-sm">
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="whitespace-nowrap border border-edge bg-canvas px-3 py-1.5 text-center font-bold text-ink"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 表は静的で並べ替えないため添字で足りる
                  <tr key={rowIndex}>
                    {row.map((cell, i) => (
                      <td
                        // biome-ignore lint/suspicious/noArrayIndexKey: 同じ行に同じ値が並ぶのでセルの値はキーにできない
                        key={i}
                        className="whitespace-nowrap border border-edge px-3 py-1.5 text-ink-soft"
                      >
                        <DrillText text={cell} marks={marks} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
  }
};
