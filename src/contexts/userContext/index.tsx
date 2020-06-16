import { createContext } from "react";

export interface ISession {
  webId: string;
}

export interface UserContext {
  session: ISession | undefined; // TODO replace with SAF session context
  isLoadingSession: boolean;
}

export default createContext<UserContext>({
  session: undefined,
  isLoadingSession: true,
});
