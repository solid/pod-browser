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

import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  FormControl,
  InputAdornment,
  InputLabel,
  Input,
  Button,
  Avatar,
} from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import AccountCircle from "@material-ui/icons/AccountCircle";
import PersonIcon from "@material-ui/icons/Person";
import Skeleton from "@material-ui/lab/Skeleton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useRouter } from "next/router";
import T from "prop-types";
import { backToDetailsClick } from "..";
import styles from "../../styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceSharingLoading({ iri, name }) {
  const classes = useStyles();
  const router = useRouter();

  return (
    <>
      <section className={classes.headerSection}>
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={backToDetailsClick(router)}
        >
          Details
        </Button>

        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Default Access</h5>
        <List>
          <ListItem key={0} className={classes.listItem}>
            <Avatar className={classes.avatar}>
              <FolderIcon />
            </Avatar>

            <Skeleton width={150} />
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>My Access</h5>
        <List>
          <ListItem key={0} className={classes.listItem}>
            <Avatar className={classes.avatar} />

            <Skeleton width={150} />
          </ListItem>
        </List>
      </section>

      <section className={classes.centeredSection}>
        <List>
          <ListItem key={0} className={classes.listItem}>
            <ListItemIcon>
              <PersonIcon />
              People
            </ListItemIcon>
          </ListItem>

          <ListItem key={1} className={classes.listItem}>
            <Avatar className={classes.avatar} />
            <Skeleton width={150} />
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]} title={iri}>
          Grant Permission
        </h5>

        <FormControl className={classes.agentInput}>
          <InputLabel htmlFor="agent-web-id">Web ID</InputLabel>
          <Input
            disabled
            id="agent-web-id"
            // prettier-ignore
            startAdornment={(
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            )}
          />
        </FormControl>

        <Button variant="contained" disabled>
          Add
        </Button>
      </section>
    </>
  );
}

ResourceSharingLoading.propTypes = {
  iri: T.string.isRequired,
  name: T.string.isRequired,
};
