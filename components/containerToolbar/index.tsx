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
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import { Grid } from "@material-ui/core";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import InfoIcon from "@material-ui/icons/Info";
import AddFileButton from "../addFileButton";
import styles from "./styles";

import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";

import ResourceLink from "../resourceLink";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface IContainerToolbar {
  onSave: () => void;
}

export default function ContainerToolbar(
  props: IContainerToolbar
): ReactElement | null {
  const { onSave } = props;
  const bem = useBem(useStyles());

  return (
    <Grid container spacing={1} justify="flex-end" alignItems="center">
      <Grid item>
        <ResourceLink
          action={DETAILS_CONTEXT_ACTIONS.DETAILS}
          className={bem("container-toolbar__trigger")}
        >
          <InfoIcon />
        </ResourceLink>
      </Grid>

      <Grid item>
        <AddFileButton onSave={onSave} />
      </Grid>
    </Grid>
  );
}
