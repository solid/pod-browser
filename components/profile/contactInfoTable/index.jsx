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

import { Button, Table as PrismTable } from "@inrupt/prism-react-components";
import styles from "./styles";
import { chain } from "../../../src/solidClientHelpers/utils";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_DELETE_BUTTON = "profile-<TYPE>-delete-button";
const TESTCAFE_ID_EXISTING_TYPE = "profile-<TYPE>-existing-type";
const TESTCAFE_ID_EXISTING_VALUE = "profile-<TYPE>-existing-value";
const TESTCAFE_ID_ADD_BUTTON = "profile-<TYPE>-add-button";
export const TESTCAFE_ID_NEW_TYPE = "profile-<TYPE>-new-type";
const TESTCAFE_ID_NEW_VALUE = "profile-<TYPE>-new-value";

export const CONTACT_INFO_TYPE_EMAIL = "email";
export const CONTACT_INFO_TYPE_PHONE = "phone";

const CONTACT_TYPE_LABEL_MAP = {
  [vcard.Home]: "Home",
  [vcard.Work]: "Work",
};

export const PREFIX_MAP = {
  [vcard.hasTelephone]: "tel:",
  [vcard.hasEmail]: "mailto:",
};

export const DEFAULT_CONTACT_TYPE = vcard.Home;

export function setupAddContactDetail(
  property,
  newContactType,
  newContactValue,
  dataset,
  profile,
  saveHandler,
  setNewContactValue
) {
  return async () => {
    const prefix = PREFIX_MAP[property];
    const newContactDetail = chain(
      setUrl(createThing(), rdf.type, newContactType),
      (t) => setUrl(t, vcard.value, `${prefix}${newContactValue}`)
    );

    const datasetWithContactDetail = setThing(dataset, newContactDetail);

    const newProfile = addUrl(
      profile,
      property,
      asUrl(newContactDetail, getSourceUrl(dataset))
    );

    await saveHandler(newProfile, datasetWithContactDetail);

    setNewContactValue("");
  };
}

export function setupSaveHandler(fetch, setDataset) {
  return async (newThing, datasetToUpdate) => {
    const savedDataset = await saveSolidDatasetAt(
      getSourceUrl(datasetToUpdate),
      setThing(datasetToUpdate, newThing),
      { fetch }
    );
    setDataset(savedDataset);
  };
}

export function setupRemoveRow(profile, property, saveHandler, dataset) {
  return async (rowThing) => {
    const contactDetailUrl = asUrl(rowThing);
    const newProfile = removeUrl(profile, property, contactDetailUrl);
    await saveHandler(newProfile, dataset);
  };
}

export function setupDeleteButtonCell(editing, contactInfoType, removeRow) {
  return () => {
    const { thing: rowThing } = useThing();

    if (!editing) {
      return null;
    }

    return (
      <Button
        onClick={() => removeRow(rowThing)}
        data-testid={TESTCAFE_ID_DELETE_BUTTON.replace(
          "<TYPE>",
          contactInfoType
        )}
        variant="secondary"
      >
        Delete
      </Button>
    );
  };
}

export function setupRowProps(bem) {
  return () => ({
    className: bem("table__body-row"),
  });
}

export function setupColumnTypeBody(contactInfoType) {
  // eslint-disable-next-line react/prop-types
  return ({ value }) => {
    const existingTypeValue = CONTACT_TYPE_LABEL_MAP[value] || value;
    const datatestid = TESTCAFE_ID_EXISTING_TYPE.replace(
      "<TYPE>",
      contactInfoType
    );
    return (
      <Typography title={value} data-testid={datatestid}>
        {existingTypeValue}
      </Typography>
    );
  };
}

export function setupOnSave(setDataset) {
  return (savedDataset) => {
    setDataset(savedDataset);
  };
}

export function setupColumnValueBody(editing, contactInfoType, bem, onSave) {
  return () => (
    <Typography>
      <Value
        edit={editing}
        autosave
        dataType="url"
        inputProps={{
          className: bem("input"),
          "data-testid": TESTCAFE_ID_EXISTING_VALUE.replace(
            "<TYPE>",
            contactInfoType
          ),
        }}
        property={vcard.value}
        onSave={onSave}
      />
    </Typography>
  );
}

export function setupOnChange(setFn) {
  return (e) => setFn(e.target.value);
}

export default function ContactTable({
  webId,
  editing,
  property,
  values,
  contactInfoType,
}) {
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);

  const [newContactType, setNewContactType] = useState(DEFAULT_CONTACT_TYPE);
  const [newContactValue, setNewContactValue] = useState("");
  const { fetch } = useSession();

  const { solidDataset: dataset, setDataset } = useContext(DatasetContext);
  const profile = dataset && getThing(dataset, webId);
  const contactDetailUrls = profile && getUrlAll(profile, property);
  const contactDetailThings = contactDetailUrls?.map((url) => ({
    dataset,
    thing: dataset && getThing(dataset, url),
  }));

  const saveHandler = setupSaveHandler(fetch, setDataset);

  const addContactDetail = setupAddContactDetail(
    property,
    newContactType,
    newContactValue,
    dataset,
    profile,
    saveHandler,
    setNewContactValue
  );

  const removeRow = setupRemoveRow(profile, property, saveHandler, dataset);
  const DeleteButtonCell = setupDeleteButtonCell(
    editing,
    contactInfoType,
    removeRow
  );
  const getRowProps = setupRowProps(bem);
  const columnTypeBody = setupColumnTypeBody(contactInfoType);
  const onSave = setupOnSave(setDataset);
  const columnValueBody = setupColumnValueBody(
    editing,
    contactInfoType,
    bem,
    onSave
  );
  const newContactTypeOnChange = setupOnChange(setNewContactType);
  const newContactValueOnChange = setupOnChange(setNewContactValue);

  if (!dataset && !values) {
    return null;
  }
  if (editing) {
    return (
      <>
        <Box mb={1}>
          <Table
            things={contactDetailThings}
            className={clsx(tableClass, bem("table"))}
            getRowProps={getRowProps}
          >
            <TableColumn
              property={rdf.type}
              body={columnTypeBody}
              dataType="url"
              header={() => null}
            />
            <TableColumn
              property={vcard.value}
              body={columnValueBody}
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
        <Box display="flex" alignItems="center">
          <Box>
            <FormControl className={classes.formControl} variant="outlined">
              <Select
                value={newContactType}
                onChange={newContactTypeOnChange}
                data-testid={TESTCAFE_ID_NEW_TYPE.replace(
                  "<TYPE>",
                  contactInfoType
                )}
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
              onChange={newContactValueOnChange}
              className={bem("input")}
              data-testid={TESTCAFE_ID_NEW_VALUE.replace(
                "<TYPE>",
                contactInfoType
              )}
            />
          </Box>

          <Box width="8.25em" textAlign="center">
            <Button
              onClick={addContactDetail}
              variant="secondary"
              data-testid={TESTCAFE_ID_ADD_BUTTON.replace(
                "<TYPE>",
                contactInfoType
              )}
            >
              Add
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <Box mb={1}>
      <table className={clsx(tableClass, bem("table"))}>
        <tbody>
          {values.map((item) => {
            return (
              <tr>
                <td>
                  <Typography>{CONTACT_TYPE_LABEL_MAP[item.type]}</Typography>
                </td>
                <td>
                  <Typography>{item.value}</Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}

ContactTable.propTypes = {
  editing: T.bool,
  property: T.string.isRequired,
  contactInfoType: T.oneOf([CONTACT_INFO_TYPE_EMAIL, CONTACT_INFO_TYPE_PHONE])
    .isRequired,
  values: T.arrayOf(T.shape({ type: T.string, value: T.string })),
  webId: T.string.isRequired,
};

ContactTable.defaultProps = {
  editing: false,
  values: [],
};
