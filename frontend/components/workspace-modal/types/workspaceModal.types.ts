export type Role = "owner" | "admin" | "member";

export type Member = {
  userId: string;
  name: string;
  lastName?: string;
  role: Role;
  joinedAt?: string | Date;
  isYou: boolean;
};

export type TabKey = "join" | "members" | "activity";

export type WorkspaceModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};
