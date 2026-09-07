export type Unit = "mm" | "cm" | "in" | "px";
export type Orientation = "portrait" | "landscape";
export type FitMode = "fit" | "fill" | "stretch";
export type ObjectType = "image" | "text" | "rect" | "circle" | "line";
export type TextAlign = "left" | "center" | "right";

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DocumentSettings {
  paper: string;
  /** trim width in mm (already oriented) */
  width: number;
  /** trim height in mm (already oriented) */
  height: number;
  orientation: Orientation;
  unit: Unit;
  margins: Margins;
  marginsLocked: boolean;
  bleed: number;
  gutterH: number;
  gutterV: number;
  cropMarks: boolean;
  background: string;
}

export interface ImageAsset {
  id: string;
  name: string;
  src: string;
  type: string;
  fileSize: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface PlacedObject {
  id: string;
  type: ObjectType;
  name: string;
  assetId?: string | undefined;
  /** mm, relative to top-left of trim page */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  fit: FitMode;
  text?: string | undefined;
  fontSize?: number | undefined;
  color?: string | undefined;
  bold?: boolean | undefined;
  italic?: boolean | undefined;
  align?: TextAlign | undefined;
  strokeWidth?: number | undefined;
  fill?: string | undefined;
}

export interface Page {
  id: string;
  objects: PlacedObject[];
}

export interface Project {
  name: string;
  doc: DocumentSettings;
  pages: Page[];
}

export interface Template {
  id: string;
  name: string;
  doc: DocumentSettings;
  objects: Omit<PlacedObject, "assetId">[];
}

export interface PrintProfile {
  id: string;
  name: string;
  paper: string;
  orientation: Orientation;
  margins: Margins;
  bleed: number;
  gutterH: number;
  gutterV: number;
  cropMarks: boolean;
  pdfQuality: "standard" | "high" | "maximum";
}
