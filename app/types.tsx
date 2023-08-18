export enum IdentityType {
  USER,
  ROBOT,
}
export interface Identity {
  identity: string;
  avatarUrl: string;
  nickName: string;
  type: IdentityType;
}
export interface ChatItem {
  type: IdentityType;
  content: string;
  appendix: Map<string, Array<any>>;
  references: Array<any>;
}
export interface ChatHistory {
  history: Array<ChatItem>;
}

export interface Conversation {
  id: Number;
  displayName: string;
  selected: boolean;
  date: Date;
}
