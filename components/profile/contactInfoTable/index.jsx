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

import T from "prop-types";
import React, { useContext, useState } from "react";
import { rdf, vcard } from "rdf-namespaces";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  addUrl,
  asUrl,
  createThing,
  getSourceUrl,
  getThing,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";

import {
  DatasetContext,
  Table,
  TableColumn,
  useSession,
  useThing,
  Value,
} from "@inrupt/solid-ui-react";

import {
  Box,
  MenuItem,
  Typography,
  FormControl,
  Select,
  createStyles,
} from "@material-ui/core";

import { Table as PrismTable } from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const CONTACT_TYPE_LABEL_MAP = {
  [vcard.Home]: "Home",
  [vcard.Work]: "Work",
};

const PREFIX_MAP = {
  [vcard.hasTelephone]: "tel:",
  [vcard.hasEmail]: "mailto:",
};

const DEFAULT_CONTACT_TYPE = vcard.Home;

export default function ContactTable({ editing, property }) {
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);

  const [newContactType, setNewContactType] = useState(DEFAULT_CONTACT_TYPE);
  const [newContactValue, setNewContactValue] = useState("");
  const { fetch } = useSession();
  const { dataset, setDataset } = useContext(DatasetContext);
  const { thing: profile } = useThing();

  const contactDetailUrls = getUrlAll(profile, property);
  const contactDetailThings = contactDetailUrls.map((url) => ({
    dataset,
    thing: getThing(dataset, url),
  }));

  const saveHandler = async (newThing, datasetToUpdate) => {
    const savedDataset = await saveSolidDatasetAt(
      getSourceUrl(datasetToUpdate),
      setThing(datasetToUpdate, newThing),
      { fetch }
    );
    setDataset(savedDataset);
  };

  const addContactDetail = async () => {
    const prefix = PREFIX_MAP[property];
    const newContactDetail = setUrl(createThing(), rdf.type, newContactType);
    const newContactDetailWithValue = setUrl(
      newContactDetail,
      vcard.value,
      `${prefix}${newContactValue}`
    );

    const datasetWithContactDetail = setThing(
      dataset,
      newContactDetailWithValue
    );

    const newProfile = addUrl(
      profile,
      property,
      asUrl(newContactDetailWithValue, getSourceUrl(dataset))
    );

    await saveHandler(newProfile, datasetWithContactDetail);

    setNewContactValue("");
  };

  const removeRow = async (rowThing) => {
    const contactDetailUrl = asUrl(rowThing);
    const newProfile = removeUrl(profile, property, contactDetailUrl);
    await saveHandler(newProfile, dataset);
  };

  const DeleteButtonCell = () => {
    const { thing: rowThing } = useThing();

    if (!editing) {
      return null;
    }

    return (
      <button
        onClick={() => removeRow(rowThing)}
        className={bem("button", "action")}
        type="button"
      >
        Delete
      </button>
    );
  };

  return (
    <>
      <Box mb={1}>
        <Table
          things={contactDetailThings}
          className={clsx(tableClass, bem("table"))}
          getRowProps={() => ({
            className: clsx(bem("table__body-row")),
          })}
        >
          <TableColumn
            property={rdf.type}
            body={({ value }) => {
              return (
                <Typography title={value}>
                  {CONTACT_TYPE_LABEL_MAP[value] || value}
                </Typography>
              );
            }}
            dataType="url"
            header={() => null}
          />

          <TableColumn
            property={vcard.value}
            body={() => (
              <Typography>
                <Value
                  edit={editing}
                  autosave
                  dataType="url"
                  inputProps={{ className: bem("input") }}
                  property={vcard.value}
                  onSave={(savedDataset) => {
                    setDataset(savedDataset);
                  }}
                />
              </Typography>
            )}
            dataType="url"
            header={() => null}
          />

          <TableColumn
            property={vcard.value}
            body={DeleteButtonCell}
            dataType="url"
            header=""
          />
        </Table>
      </Box>

      {editing && (
        <>
          <Box display="flex" alignItems="center">
            <Box>
              <FormControl className={classes.formControl} variant="outlined">
                <Select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value)}
                >
                  {Object.keys(CONTACT_TYPE_LABEL_MAP).map((iri) => (
                    <MenuItem key={iri} value={iri}>
                      {CONTACT_TYPE_LABEL_MAP[iri]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box width="100%" ml={1} mr={1}>
              <input
                label="Value"
                value={newContactValue}
                onChange={(e) => setNewContactValue(e.target.value)}
                className={bem("input")}
              />
            </Box>

            <Box width="8.25em" textAlign="center">
              <button
                type="button"
                onClick={addContactDetail}
                className={bem("button", "action")}
              >
                Add
              </button>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

ContactTable.propTypes = {
  editing: T.bool,
  property: T.string.isRequired,
};

ContactTable.defaultProps = {
  editing: false,
};
