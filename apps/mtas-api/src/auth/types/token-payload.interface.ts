export type TokenPayload =
  | {
      id: number;
      type: 'user';
      // For appId to allow client to reject other client's token
      aud: string;
    }
  | {
      id: number;
      type: 'client';
    };
