import { assetUrl } from "@/base-path";
import type { QuestionImage, Stem } from "../types";

/** 原本のページから切り出した図。拡大しても粗くならないよう、原寸を上限にする。 */
export const OriginalFigure = ({ image }: { image: QuestionImage }) => {
  return (
    // biome-ignore lint/performance/noImgElement: static export で最適化サーバが無く、原寸で出すため
    <img
      src={assetUrl(image.src)}
      width={image.width}
      height={image.height}
      alt={image.alt}
      className="h-auto max-w-full"
      style={{ width: image.width }}
    />
  );
};

/** 問題文に添えられた図・箇条書き・表。 */
export const StemBlock = ({ stem }: { stem: Stem }) => {
  return (
    <div className="flex flex-col gap-4">
      {stem.list && (
        <div className="flex flex-col gap-2">
          {stem.list.title && (
            <div className="font-bold text-[13px] text-ink">{stem.list.title}</div>
          )}
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            {stem.list.items.map((item) => (
              <li key={item} className="text-pretty text-[14px] text-ink-soft leading-[1.85]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stem.table && (
        <div className="flex flex-col gap-1.5">
          {stem.table.caption && (
            <div className="text-right text-[11.5px] text-muted-soft">{stem.table.caption}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-[320px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {stem.table.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border border-edge bg-canvas px-3.5 py-2 text-center font-bold text-ink"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stem.table.rows.map((row, rowIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 表は静的で並べ替えないため添字で足りる
                  <tr key={rowIndex}>
                    {row.map((cell, i) => (
                      <td
                        // biome-ignore lint/suspicious/noArrayIndexKey: 同じ行に同じ値が並ぶのでセルの値はキーにできない
                        key={i}
                        className={`border border-edge px-3.5 py-2 tabular-nums ${
                          i === 0 ? "text-ink" : "text-center text-ink-soft"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stem.image && (
        <div className="flex justify-center py-1">
          <OriginalFigure image={stem.image} />
        </div>
      )}
    </div>
  );
};
