import { ReactElement, SyntheticEvent } from "react";
import Router from "next/router";
import { Button } from "@material-ui/core";

import auth from "solid-auth-client";

export async function onLogOutClick(
  e: SyntheticEvent<EventTarget>
): Promise<void> {
  e.preventDefault();
  await auth.logout();

  Router.push("/login").catch((error) => {
    throw error;
  });
}

export default function LogOut(): ReactElement {
  return (
    <Button onClick={onLogOutClick} variant="contained">
      Log out
    </Button>
  );
}
