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

import { ReactElement } from "react";
import {
  Button,
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/styles";
import { PrismTheme } from "@solid/lit-prism-patterns";
import styles from "./styles";
import { IResourceDetails } from "../../src/lit-solid-helpers";
import { parseUrl } from "../../src/stringHelpers";

interface IDownloadLink {
  type: string;
  iri: string;
  className: string;
}

export function displayType(types: string[] | undefined): string {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

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

export function DownloadLink(props: IDownloadLink): ReactElement | null {
  const { type, iri, className } = props;
  if (type.match(/container/i)) return null;

  return (
    <Button
      variant="contained"
      onClick={downloadResource(iri)}
      className={className}
    >
      Download
    </Button>
  );
}

interface IDetailsProps {
  resource: IResourceDetails;
}

export default function ResourceDetails({
  resource,
}: IDetailsProps): ReactElement {
  const router = useRouter();
  const classes = useStyles();
  const { pathname } = router;
  const { iri, name, types } = resource;
  const type = displayType(types);

  return (
    <>
      <section className={classes.headerSection}>
        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Actions</h5>
        <List>
          <ListItem button>
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sharing &amp; App Permissions"
              onClick={async () => {
                await router.replace({
                  pathname,
                  query: { action: "sharing", iri },
                });
              }}
            />
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Details</h5>
      </section>

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
        <DownloadLink
          type={type}
          iri={iri}
          className={classes.downloadButton}
        />
      </section>
    </>
  );
}
