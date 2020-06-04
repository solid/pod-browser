import { ReactElement } from "react";
import { useRedirectIfLoggedIn } from "../../../src/effects/auth";
import LoginForm from "../../login";

export default function Login(): ReactElement {
  useRedirectIfLoggedIn();

  return <LoginForm />;
}
