import type { DiagramFigure } from "@/features/quiz/types";

const flat = (text: string): string => text.replaceAll("\n", " ");

/**
 * 構成図の代替テキスト。機器（注記のアドレスなど）、つながり（線のラベル）、囲みの名前を文で並べる。
 * 読み上げでも、どの機器がどこにつながり、どのアドレスを持つかが分かるようにする。
 */
export const networkDescription = (figure: DiagramFigure): string => {
  const nameOf = (id: string): string =>
    flat(figure.nodes.find((node) => node.id === id)?.label ?? id);
  const nodes = figure.nodes
    .map((node) => (node.note ? `${flat(node.label)}（${flat(node.note)}）` : flat(node.label)))
    .join("、");
  const links = (figure.edges ?? [])
    .map(
      (edge) =>
        `${nameOf(edge.from)}－${nameOf(edge.to)}${edge.label ? `（${flat(edge.label)}）` : ""}`,
    )
    .join("、");
  const groups = (figure.groups ?? []).map((group) => flat(group.label)).join("、");
  return [
    figure.caption,
    `機器：${nodes}`,
    ...(links ? [`接続：${links}`] : []),
    ...(groups ? [`範囲：${groups}`] : []),
  ]
    .map((part) => `${part}。`)
    .join("");
};
