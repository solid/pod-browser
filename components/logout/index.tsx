import { ReactElement, SyntheticEvent } from "react";
import Router from "next/router";
import { Button } from "@material-ui/core";

import { logout } from "@inrupt/solid-auth-fetcher";

export function onLogOutClick(e: SyntheticEvent<EventTarget>): void {
  e.preventDefault();

  logout().catch((error) => {
    throw error;
  });

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
