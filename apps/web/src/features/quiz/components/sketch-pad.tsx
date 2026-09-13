"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { Stroke } from "../notes/note";
import { SKETCH_HEIGHT, SKETCH_WIDTH } from "../notes/note";
import { appendPoint, logicalPoint } from "../notes/sketch";

type SketchPadProps = {
  strokes: Stroke[];
  /** ドラッグを終えたひと筆。点は論理座標。 */
  onAddStroke: (stroke: Stroke) => void;
};

/** 線の太さと色（論理座標での太さ。表示のときに枠の幅へ合わせて縮む）。 */
const LINE_WIDTH = 9;
const INK = "#2b313c";

/**
 * ドラッグで線を引く枠。
 *
 * 描いた線は点の並びとして親へ渡し、保存は親（noteStore）に任せる。ここが持つのは
 * 「今ドラッグしている最中のひと筆」だけで、それ以外は渡された strokes をそのまま描く。
 */
export const SketchPad = ({ strokes, onAddStroke }: SketchPadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 描いている途中のひと筆。描画のたびに作り直したくないので ref に置く。
  const drawingRef = useRef<Stroke | null>(null);

  /** 枠の中身を描き直す。保存済みのひと筆と、描いている最中のひと筆を続けて描く。 */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    // jsdom には 2d コンテキストが無い。見た目だけの処理なので、その場合は何もしない。
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const scale = canvas.width / SKETCH_WIDTH;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = LINE_WIDTH;
    context.strokeStyle = INK;

    const drawing = drawingRef.current;
    for (const stroke of drawing ? [...strokes, drawing] : strokes) {
      context.beginPath();
      for (let index = 0; index + 1 < stroke.length; index += 2) {
        const x = stroke[index] ?? 0;
        const y = stroke[index + 1] ?? 0;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      // 点を 1 つだけ置いたときも見えるように、線が無ければ同じ場所へ点を打つ
      if (stroke.length === 2) context.lineTo((stroke[0] ?? 0) + 0.01, stroke[1] ?? 0);
      context.stroke();
    }
  }, [strokes]);

  // 枠の幅に合わせて解像度を決め直す。幅が変わるのは画面の幅が変わるときだけ。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const width = canvas.clientWidth;
      if (width <= 0) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(width * ratio * (SKETCH_HEIGHT / SKETCH_WIDTH));
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  // 取り消しや全消し、問題の切り替えで strokes が変わったら描き直す。
  useEffect(() => {
    draw();
  }, [draw]);

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const point = logicalPoint(canvas.getBoundingClientRect(), event.clientX, event.clientY);
    if (!point) return;
    // 枠の外へ出ても線が続くようにする（jsdom には無いので省略可）。
    canvas.setPointerCapture?.(event.pointerId);
    drawingRef.current = [point.x, point.y];
    draw();
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    if (!drawing) return;
    const point = logicalPoint(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY,
    );
    if (!point || !appendPoint(drawing, point.x, point.y)) return;
    draw();
  };

  const end = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    drawingRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!drawing) return;
    onAddStroke(drawing);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="メモ（手書き）"
      // touch-none が無いと、なぞったときに線ではなくページが動く。
      className="w-full cursor-crosshair touch-none rounded-[9px] border border-edge bg-surface"
      style={{ aspectRatio: `${SKETCH_WIDTH} / ${SKETCH_HEIGHT}` }}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    />
  );
};
