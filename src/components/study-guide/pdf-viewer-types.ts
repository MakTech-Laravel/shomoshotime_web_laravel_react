export type ToolId = "select" | "comment" | "draw" | "eraser" | "attach";

export type Point = { x: number; y: number };

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  width: number;
};

export type PageComment = {
  id: string;
  x: number;
  y: number;
  text: string;
};

export type PageAnnotations = {
  strokes: Stroke[];
  comments: PageComment[];
};

export type SearchMatch = {
  page: number;
  index: number;
};

export type PageAnnotationsMap = Record<number, PageAnnotations>;

export function emptyAnnotations(): PageAnnotations {
  return { strokes: [], comments: [] };
}
