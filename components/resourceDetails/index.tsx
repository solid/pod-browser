import { ReactElement, useContext } from "react";
import { Typography, List, ListItem, Divider, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UserContext, { ISession } from "../../src/contexts/userContext";

import styles from "./styles";

import {
  getThirdPartyPermissions,
  getUserPermissions,
  NormalizedPermission,
  Profile,
} from "../../src/lit-solid-helpers";

export function displayName(
  { nickname, name }: Profile,
  webId: string
): string {
  if (name) return name;
  if (nickname) return nickname;
  return webId;
}

export function displayPermission(
  permission: NormalizedPermission | null,
  classes: Record<string, string>
): ReactElement | null {
  if (!permission) return null;
  const { webId, alias, profile } = permission;
  const { avatar } = profile;
  const avatarSrc = avatar || undefined;

  return (
    <ListItem key={webId} className={classes.listItem}>
      <Avatar
        className={classes.avatar}
        alt={displayName(profile, webId)}
        src={avatarSrc}
      />
      <Typography className={classes.detailText}>
        {displayName(profile, webId)}
      </Typography>
      <Typography className={`${classes.typeValue} ${classes.detailText}`}>
        {alias}
      </Typography>
    </ListItem>
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

const useStyles = makeStyles(styles);

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
  const resourceClasses: Record<string, string> = {
    ...classes,
    ...useStyles(),
  };
  const { session } = useContext(UserContext);
  const { webId } = session as ISession;
  const userPermissions = getUserPermissions(webId, permissions);
  const thirdPartyPermissions = getThirdPartyPermissions(webId, permissions);

  return (
    <>
      <section className={resourceClasses.centeredSection}>
        <Typography variant="h3" title={iri}>
          {name}
        </Typography>
      </section>

      <section className={resourceClasses.centeredSection}>
        <Typography variant="h5">Details</Typography>
      </section>

      <Divider />

      <section className={resourceClasses.centeredSection}>
        <Typography variant="h5">My Access</Typography>
        <List>{displayPermission(userPermissions, resourceClasses)}</List>
      </section>

      {displayThirdPartyPermissions(thirdPartyPermissions, resourceClasses)}

      <Divider />

      <section className={resourceClasses.centeredSection}>
        <List>
          <ListItem className={resourceClasses.listItem}>
            <Typography className={resourceClasses.detailText}>
              Thing Type:
            </Typography>
            <Typography
              className={`${resourceClasses.typeValue} ${resourceClasses.detailText}`}
            >
              Resource
            </Typography>
          </ListItem>
        </List>
      </section>
    </>
  );
}
