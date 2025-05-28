export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  isEditing?: boolean;
}

export interface CanvasItem {
  id: string;
  type: "note" | "todo" | "image";
  x: number;
  y: number;
  content: string;
  todos?: TodoItem[];
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  noteWidth?: number;
  noteHeight?: number;
  completed?: boolean;
  isEditing?: boolean;
  color?: string;
  rotation?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 