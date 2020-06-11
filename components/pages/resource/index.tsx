import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { Container } from "@material-ui/core";
import { DetailsMenuProvider } from "../../../src/contexts/detailsMenuContext";
import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import ContainerView from "../../container";

export default function Resource(): ReactElement {
  useRedirectIfLoggedOut();

  const router = useRouter();
  const decodedIri = decodeURIComponent(router.query.iri as string);

  return (
    <Container>
      <DetailsMenuProvider>
        <ContainerView iri={decodedIri} />
      </DetailsMenuProvider>
    </Container>
  );
}
