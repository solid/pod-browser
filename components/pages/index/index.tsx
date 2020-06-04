import React, { ReactElement } from "react";
import { Container } from "@material-ui/core";

import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import ContainerView from "../../containerView";

export default function Home(): ReactElement {
  useRedirectIfLoggedOut();

  // TODO move Loading indicator into separate component
  // TODO above todo was done but thinking we should
  // move header and isloading.. spinner into one as well so that it's a different
  // header if logged in etc...
  return (
    <Container>
      <ContainerView />
    </Container>
  );
}
