/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import { Typography, List, ListItem, Divider } from "@material-ui/core";
import { ILoggedInSolidSession } from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";
import UserContext from "../../src/contexts/UserContext";
import {
  NormalizedPermission,
  getUserPermissions,
  getThirdPartyPermissions,
} from "../../src/lit-solid-helpers";

function displayBoolean(bool: boolean): string {
  return bool ? "true" : "false";
}

export function displayPermission(
  permission: NormalizedPermission | null,
  classes: Record<string, string>
): ReactElement | null {
  if (!permission) return null;
  const { webId, alias, acl } = permission;

  return (
    <>
      <ListItem key={webId} className={classes.listItem}>
        <Typography className={classes.detailText}>{webId}</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {alias}
        </Typography>
      </ListItem>
      <ListItem key={`${webId}-read`} className={classes.listItem}>
        <Typography className={classes.detailText}>read</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {displayBoolean(acl.read)}
        </Typography>
      </ListItem>
      <ListItem key={`${webId}-write`} className={classes.listItem}>
        <Typography className={classes.detailText}>write</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {displayBoolean(acl.write)}
        </Typography>
      </ListItem>
      <ListItem key={`${webId}-append`} className={classes.listItem}>
        <Typography className={classes.detailText}>append</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {displayBoolean(acl.append)}
        </Typography>
      </ListItem>
      <ListItem key={`${webId}-details`} className={classes.listItem}>
        <Typography className={classes.detailText}>control</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {displayBoolean(acl.control)}
        </Typography>
      </ListItem>
    </>
  );
}

function displayThirdPartyPermissions(
  thirdPartyPermissions: NormalizedPermission[] | null,
  classes: Record<string, string>
): ReactElement | null {
  if (!thirdPartyPermissions) return null;

  const items = thirdPartyPermissions.map((permission): ReactElement | null =>
    displayPermission(permission, classes)
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
  classes: Record<string, string>;
  types?: string[];
}

export default function ResourceDetails({
  iri,
  name,
  permissions,
  classes,
}: Props): ReactElement {
  const { session } = useContext(UserContext);
  const { webId } = session as ILoggedInSolidSession;
  const userPermissions = getUserPermissions(webId, permissions);
  const thirdPartyPermissions = getThirdPartyPermissions(webId, permissions);

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

      {displayThirdPartyPermissions(thirdPartyPermissions, classes)}

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
