export type DataObject = Record<string, unknown> & {
  id?: string;
  title?: string;
  name?: string;
  [key: string]: unknown;
};

export interface Course extends DataObject {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  progress?: number;
  materials?: Material[];
  _count?: { materials?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Material extends DataObject {
  id: string;
  fileName?: string;
  filename?: string;
  status?: string;
  size?: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
  summary?: unknown;
}

export interface StudyMessage {
  id?: string;
  role?: string;
  content?: string;
  sources?: unknown[];
}
