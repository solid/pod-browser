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
import { Typography, Divider, List, ListItem } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import styles from "./styles";
import { NormalizedResource } from "../../src/lit-solid-helpers";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

interface ResourceDetails extends NormalizedResource {
  name: string;
}

interface Props {
  resource: ResourceDetails;
}

export default function DetailsLoading({ resource }: Props): ReactElement {
  const classes = useStyles();
  const { name, iri } = resource;

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
          <ListItem className={classes.listItem}>
            <Skeleton
              className={classes.avatar}
              variant="circle"
              width={45}
              height={40}
            />
            <Skeleton variant="text" width="100%" />
          </ListItem>
        </List>
      </section>

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Sharing</h5>

        <List>
          <ListItem className={classes.listItem}>
            <Skeleton
              className={classes.avatar}
              variant="circle"
              width={45}
              height={40}
            />
            <Skeleton variant="text" width="100%" />
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>Thing Type:</Typography>
            <Skeleton variant="text" width="50%" />
          </ListItem>
        </List>
      </section>
    </>
  );
}
