export type Role = "admin" | "editor";

export type User = {
  id: string;
  name: string;
  role: Role;
  /** оттенок серого для аватара-инициалов */
  color: string;
  username?: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type ColumnId = "todo" | "doing" | "review" | "revisions" | "ready" | "published";

export type VideoFormat = "9:16" | "1:1" | "16:9";

export type Source = {
  id: string;
  kind: "file" | "link";
  url: string;
  name: string;
  poster?: string;
};

export type Version = {
  id: string;
  n: number;
  url: string;
  name?: string;
  poster?: string;
  at: number;
  byId: string;
  note?: string;
};

export type Revision = {
  id: string;
  versionId: string;
  atSec: number;
  text: string;
  byId: string;
  at: number;
  resolved: boolean;
};

export type Comment = {
  id: string;
  byId: string;
  text: string;
  at: number;
};

export type HistoryEntry = {
  id: string;
  byId: string;
  at: number;
  text: string;
  from?: ColumnId;
  to?: ColumnId;
};

export type ClientFeedback = {
  liked: boolean;
  comment: string;
  at: number;
  versionId?: string;
};

export type Brief = {
  script: string;
  notes: string;
  references: string[];
  format: VideoFormat;
  duration: string;
};

export type Task = {
  id: string;
  categoryId: string;
  title: string;
  assigneeId: string;
  column: ColumnId;
  createdAt: number;
  deadline: number;
  price: number;
  cover?: string;
  brief: Brief;
  sources: Source[];
  versions: Version[];
  revisions: Revision[];
  comments: Comment[];
  history: HistoryEntry[];
  acceptedAt?: number;
  publishedAt?: number;
  clientFeedback?: ClientFeedback;
};

export type Payout = {
  id: string;
  userId: string;
  amount: number;
  at: number;
  note: string;
};

export type State = {
  version: 1;
  currentUserId: string;
  users: User[];
  categories: Category[];
  tasks: Task[];
  payouts: Payout[];
  defaultPrices: Record<VideoFormat, number>;
};
