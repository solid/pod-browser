import { createContext } from "react";

// Not sure if this is the correct interface:
import ISolidSession from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";

interface UserContext {
  session: ISolidSession | undefined;
  isLoadingSession: boolean;
}

export default createContext<UserContext>({
  session: undefined,
  isLoadingSession: true,
});
