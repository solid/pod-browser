/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import { Typography, List, ListItem, Divider } from "@material-ui/core";
import UserContext from "../../src/contexts/UserContext";
import {
  NormalizedPermission,
  getUserPermissions,
  getThirdPartyPermissions,
} from "../../src/lit-solid-helpers";

export function displayPermission(
  { webId, alias }: NormalizedPermission,
  classes: Record<string, unknown>
): ReactElement {
  return (
    <ListItem key={webId} className={classes.listItem}>
      <Typography className={classes.detailText}>{webId}</Typography>
      <Typography className={`${classes.typeValue} ${classes.detailText}`}>
        {alias}
      </Typography>
    </ListItem>
  );
}

function displayThirdPartyPermissions(
  thirdParterPermissions: NormalizedPermission[],
  classes: Record<string, string>
): ReactElement {
  const items = thirdParterPermissions.map(
    (permission): ReactElement => displayPermission(permission, classes)
  );

  if (items.length === 0) {
    return (
      <section className={classes.centeredSection}>
        <Typography variant="h5">Sharing</Typography>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>
              No 3rd party access
            </Typography>
          </ListItem>
        </List>
      </section>
    );
  }

  return (
    <section className={classes.centeredSection}>
      <Typography variant="h5">Sharing</Typography>
      <List>{items}</List>
    </section>
  );
}

export interface Props {
  iri: string;
  name?: string;
  permissions?: NormalizedPermission[];
  classes: Record<string, unknown>;
  types?: string[];
}

export default function ResourceDetails({
  iri,
  name,
  permissions,
  classes,
}: Props): ReactElement {
  const { session } = useContext(UserContext);
  const { webId } = session;
  const userPermissions = getUserPermissions(permissions, webId);
  const thirdParterPermissions = getThirdPartyPermissions(permissions, webId);

  return (
    <>
      <section className={classes.centeredSection}>
        <Typography variant="h3" title={iri}>
          {name}
        </Typography>
      </section>

      <section className={classes.centeredSection}>
        <Typography variant="h5">Details</Typography>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <Typography variant="h5">My Access</Typography>
        <List>{displayPermission(userPermissions, classes)}</List>
      </section>

      {displayThirdPartyPermissions(thirdParterPermissions, classes)}

      <Divider />

      <section className={classes.centeredSection}>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>Thing Type:</Typography>
            <Typography
              className={`${classes.typeValue} ${classes.detailText}`}
            >
              Resource
            </Typography>
          </ListItem>
        </List>
      </section>
    </>
  );
}
