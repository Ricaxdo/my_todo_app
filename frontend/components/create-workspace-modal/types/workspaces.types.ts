export type TabKey = "create" | "join";

export type IconId =
  | "home"
  | "team"
  | "work"
  | "rocket"
  | "sparkles"
  | "coffee"
  | "heart"
  | "gym"
  | "shop"
  | "book"
  | "folder"
  | "calendar"
  | "code"
  | "design"
  | "music"
  | "games"
  | "tools"
  | "travel"
  | "school"
  | "location"
  | "camera"
  | "laptop"
  | "wallet"
  | "security";

export type CreateWorkspacePayload = { name: string; iconId: IconId };

export type CreateWorkspaceModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maxReached: boolean;

  onCreate: (payload: CreateWorkspacePayload) => Promise<void> | void;
  onJoin: (inviteCode: string) => Promise<void> | void;
};
