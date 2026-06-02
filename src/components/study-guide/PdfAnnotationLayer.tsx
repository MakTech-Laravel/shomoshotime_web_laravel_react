import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";

import type { PageAnnotations, Point, Stroke, ToolId } from "@/components/study-guide/pdf-viewer-types";
import { cn } from "@/lib/utils";

type PdfAnnotationLayerProps = {
  width: number;
  height: number;
  tool: ToolId;
  annotations: PageAnnotations;
  onChange: (next: PageAnnotations) => void;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function distanceToStroke(point: Point, stroke: Stroke) {
  return stroke.points.reduce((min, p) => {
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    return Math.min(min, d);
  }, Number.POSITIVE_INFINITY);
}

function pointsToPath(points: Point[]) {
  if (!points.length) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export function PdfAnnotationLayer({
  width,
  height,
  tool,
  annotations,
  onChange,
}: PdfAnnotationLayerProps) {
  const drawingRef = useRef<Stroke | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState<{ x: number; y: number } | null>(null);

  const getPoint = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): Point => {
      const rect = event.currentTarget.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * width,
        y: ((event.clientY - rect.top) / rect.height) * height,
      };
    },
    [width, height],
  );

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (tool === "select" || tool === "attach") return;

    const point = getPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "draw") {
      drawingRef.current = {
        id: uid(),
        points: [point],
        color: "#e11d48",
        width: 2.5,
      };
      return;
    }

    if (tool === "eraser") {
      const hit = annotations.strokes.find((stroke) => distanceToStroke(point, stroke) < 14);
      if (hit) {
        onChange({
          ...annotations,
          strokes: annotations.strokes.filter((s) => s.id !== hit.id),
        });
      }
      return;
    }

    if (tool === "comment") {
      setDraftComment(point);
      setActiveCommentId(null);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (tool !== "draw" || !drawingRef.current) return;
    const point = getPoint(event);
    drawingRef.current = {
      ...drawingRef.current,
      points: [...drawingRef.current.points, point],
    };
    onChange({
      ...annotations,
      strokes: [
        ...annotations.strokes.filter((s) => s.id !== drawingRef.current!.id),
        drawingRef.current,
      ],
    });
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drawingRef.current = null;
  };

  const saveDraftComment = () => {
    if (!draftComment) return;
    const text = window.prompt("Add your comment:")?.trim();
    if (!text) {
      setDraftComment(null);
      return;
    }
    const comment = { id: uid(), x: draftComment.x, y: draftComment.y, text };
    onChange({
      ...annotations,
      comments: [...annotations.comments, comment],
    });
    setDraftComment(null);
    setActiveCommentId(comment.id);
  };

  const removeComment = (id: string) => {
    onChange({
      ...annotations,
      comments: annotations.comments.filter((c) => c.id !== id),
    });
    if (activeCommentId === id) setActiveCommentId(null);
  };

  const interactive = tool !== "select" && tool !== "attach";

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        className={cn(
          "absolute left-1/2 top-0 -translate-x-1/2",
          interactive && "pointer-events-auto",
          tool === "draw" && "cursor-crosshair",
          tool === "comment" && "cursor-cell",
          tool === "eraser" && "cursor-pointer",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {annotations.strokes.map((stroke) => (
          <path
            key={stroke.id}
            d={pointsToPath(stroke.points)}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {draftComment && (
          <circle cx={draftComment.x} cy={draftComment.y} r={6} fill="#2b6cb0" />
        )}
      </svg>

      {annotations.comments.map((comment) => (
        <div
          key={comment.id}
          className="pointer-events-auto absolute"
          style={{
            left: `calc(50% - ${width / 2}px + ${comment.x}px)`,
            top: comment.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-full bg-[#2b6cb0] text-[10px] font-bold text-white shadow"
            onClick={() =>
              setActiveCommentId((current) => (current === comment.id ? null : comment.id))
            }
            aria-label="View comment"
          >
            !
          </button>
          {activeCommentId === comment.id && (
            <div className="absolute left-1/2 top-0 z-30 mt-1 w-48 -translate-x-1/2 rounded border border-[#dcdcdc] bg-white p-2 text-xs shadow-lg">
              <button
                type="button"
                className="absolute right-1 top-1 rounded p-0.5 hover:bg-[#f3f3f3]"
                onClick={() => removeComment(comment.id)}
                aria-label="Delete comment"
              >
                <X className="size-3" />
              </button>
              <p className="pr-4 font-montserrat text-[#333]">{comment.text}</p>
            </div>
          )}
        </div>
      ))}

      {draftComment && (
        <button
          type="button"
          className="pointer-events-auto absolute rounded bg-[#2b6cb0] px-2 py-1 font-montserrat text-[10px] text-white shadow"
          style={{
            left: `calc(50% - ${width / 2}px + ${draftComment.x}px)`,
            top: draftComment.y + 8,
            transform: "translateX(-50%)",
          }}
          onClick={saveDraftComment}
        >
          Save comment
        </button>
      )}
    </div>
  );
}
