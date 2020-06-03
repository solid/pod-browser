import { ReactElement, SyntheticEvent } from "react";
import Router from "next/router";
import { Button } from "@material-ui/core";

import { logout } from "@inrupt/solid-auth-fetcher";

export function onLogOutClick(e: SyntheticEvent<EventTarget>): void {
  e.preventDefault();
  logout();
  Router.push("/login");
}

export default function LogOut(): ReactElement {
  return (
    <Button onClick={onLogOutClick} variant="contained">
      Log out
    </Button>
  );
}
