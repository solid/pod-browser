/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ReactElement, useContext } from "react";
import {
  Typography,
  List,
  ListItem,
  Divider,
  Avatar,
  createStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PrismTheme } from "@solid/lit-prism-patterns";
import UserContext, { ISession } from "../../src/contexts/userContext";
import styles from "./styles";

import {
  getThirdPartyPermissions,
  getUserPermissions,
  NormalizedPermission,
  NormalizedResource,
  Profile,
} from "../../src/lit-solid-helpers";

export function displayName({ nickname, name, webId }: Profile): string {
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
        alt={displayName(profile)}
        src={avatarSrc}
      />
      <Typography className={classes.detailText}>
        {displayName(profile)}
      </Typography>
      <Typography className={`${classes.typeValue} ${classes.detailText}`}>
        {alias}
      </Typography>
    </ListItem>
  );
}

export function displayThirdPartyPermissions(
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
        <h5 className={classes["content-h5"]}>Sharing</h5>
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
      <h5 className={classes["content-h5"]}>Sharing</h5>
      <List>{items}</List>
    </section>
  );
}

export function displayType(types: string[] | undefined): string {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export interface Props extends NormalizedResource {
  name?: string;
}

export default function ResourceDetails({
  iri,
  name,
  permissions,
  types,
}: Props): ReactElement {
  const classes = useStyles();
  const { session } = useContext(UserContext);
  const { webId } = session as ISession;
  const userPermissions = getUserPermissions(webId, permissions);
  const thirdPartyPermissions = getThirdPartyPermissions(webId, permissions);

  return (
    <>
      <section className={classes.centeredSection}>
        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
      </section>

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Details</h5>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>My Access</h5>
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
              {displayType(types)}
            </Typography>
          </ListItem>
        </List>
      </section>
    </>
  );
}
