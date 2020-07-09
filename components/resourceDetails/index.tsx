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
  Avatar,
  Button,
  createStyles,
  Divider,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { PrismTheme } from "@solid/lit-prism-patterns";
import UserContext, { ISession } from "../../src/contexts/userContext";
import PermissionsForm from "../permissionsForm";
import DetailsLoading from "../detailsLoading";
import { parseUrl } from "../../src/stringHelpers";
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

export interface IPermission {
  iri: string;
  permission: NormalizedPermission | null;
  classes: Record<string, string>;
  warnOnSubmit: boolean;
}

export function Permission(props: IPermission): ReactElement | null {
  const { permission, classes, warnOnSubmit, iri } = props;
  if (!permission) return null;

  const { webId, profile } = permission;
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

      <PermissionsForm
        iri={iri}
        permission={permission}
        warnOnSubmit={warnOnSubmit}
      />
    </ListItem>
  );
}

interface IThirdPartyPermissions {
  iri: string;
  thirdPartyPermissions: NormalizedPermission[] | null;
  classes: Record<string, string>;
}

export function ThirdPartyPermissions(
  props: IThirdPartyPermissions
): ReactElement | null {
  const { iri, thirdPartyPermissions, classes } = props;

  if (!thirdPartyPermissions) return null;

  if (thirdPartyPermissions.length === 0) {
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
      <List>
        {thirdPartyPermissions.map((permission) => (
          <Permission
            iri={iri}
            permission={permission}
            classes={classes}
            key={permission.webId}
            warnOnSubmit={false}
          />
        ))}
      </List>
    </section>
  );
}

export function displayType(types: string[] | undefined): string {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

export function forceDownload(name: string, file: Blob): void {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = window.URL.createObjectURL(file);
  a.setAttribute("download", name);

  document.body.appendChild(a);

  a.click();

  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function downloadResource(iri: string) {
  return (): void => {
    const { pathname } = parseUrl(iri);
    const name = pathname.replace(/\//g, "");

    fetch(iri)
      .then((response) => response.blob())
      .then((file) => forceDownload(name, file))
      .catch((e) => e);
  };
}

interface IDownloadLink {
  type: string;
  iri: string;
}

export function DownloadLink(props: IDownloadLink): ReactElement | null {
  const { type, iri } = props;
  if (type.match(/container/i)) return null;

  return (
    <Button variant="contained" onClick={downloadResource(iri)}>
      Download
    </Button>
  );
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export interface Props extends NormalizedResource {
  name?: string;
  iri: string;
}

export default function ResourceDetails({
  iri,
  name = "",
  types = [],
  permissions,
}: Props): ReactElement {
  const classes = useStyles();
  const { session } = useContext(UserContext);
  const { webId } = session as ISession;
  const userPermissions = getUserPermissions(webId, permissions);
  const thirdPartyPermissions = getThirdPartyPermissions(webId, permissions);
  const type = displayType(types);

  // TODO:
  // Files without permissions throw an error in lit-pod.
  if (!permissions) {
    return <DetailsLoading resource={{ iri, name, types }} />;
  }

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
        <List>
          <Permission
            iri={iri}
            permission={userPermissions}
            classes={classes}
            warnOnSubmit
          />
        </List>
      </section>

      <ThirdPartyPermissions
        iri={iri}
        thirdPartyPermissions={thirdPartyPermissions}
        classes={classes}
      />

      <Divider />

      <section className={classes.centeredSection}>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>Thing Type:</Typography>
            <Typography
              className={`${classes.typeValue} ${classes.detailText}`}
            >
              {type}
            </Typography>
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <DownloadLink type={type} iri={iri} />
      </section>
    </>
  );
}
