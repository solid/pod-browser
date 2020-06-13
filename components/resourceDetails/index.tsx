/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  List,
  ListItem,
  Divider,
} from "@material-ui/core";
import { unstable_AgentAccess } from "lit-solid";
import UserContext from "../../src/contexts/UserContext";
import { normalizePermissions } from "../../src/lit-solid-helpers";


function getUserAccess(permissions, id: string) {
  return permissions.find(({ webId }) => webId === id);
}

function getThirdPartyAccess(permissions, id: string) {
  return permissions.filter(({ webId }) => webId !== id);
}

export function displayAccessItem({ webId, access }, classes) {
  return (
    <ListItem className={classes.listItem}>
      <Typography className={classes.detailText}>{webId}</Typography>
      <Typography className={`${classes.typeValue} ${classes.detailText}`}>
        {access}
      </Typography>
    </ListItem>
  );
}

function displayThirdPartyAccess(thirdPartyAccess, classes) {
  return thirdPartyAccess.map((access) => displayAccessItem(access, classes));
}

export interface Props {
  iri: string;
  name?: string;
  acl?: unstable_AgentAccess;
  classes: Record<string, unknown>;
}

export default function ResourceDetails({
  iri,
  name,
  acl,
  classes,
}: Props): ReactElement {
  const { session } = useContext(UserContext);
  const { webId } = session;
  const normalizedPerms = normalizePermissions(acl);
  const personalAccess = getUserAccess(normalizedPerms, webId);
  const thirdPartyAccess = getThirdPartyAccess(normalizedPerms, webId);

  return (
    <>
      <section className={classes.centeredSection}>
        <Typography variant="h3" title={iri}>
          {name}
        </Typography>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <Typography variant="h5">My Access</Typography>
        <List>{displayAccessItem(personalAccess, classes)}</List>
      </section>

      <section className={classes.centeredSection}>
        <Typography variant="h5">Sharing</Typography>
        <List>{displayThirdPartyAccess(thirdPartyAccess, classes)}</List>
      </section>
    </>
  );
}
