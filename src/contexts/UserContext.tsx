import { createContext } from "react";

// Not sure if this is the correct interface:
interface UserContext {
  session: any; // TODO replace with SAF session context
  isLoadingSession: boolean;
}

export default createContext<UserContext>({
  session: undefined,
  isLoadingSession: true,
});
