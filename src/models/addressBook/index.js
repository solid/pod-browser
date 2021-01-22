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

import {
  addStringNoLocale,
  addUrl,
  createSolidDataset,
  getSolidDataset,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { acl, dc, foaf, rdf, schema } from "rdf-namespaces";
import { joinPath } from "../../stringHelpers";
import { defineDataset } from "../../solidClientHelpers/utils";
import {
  GROUPS_INDEX_FILE,
  INDEX_FILE,
  PEOPLE_INDEX_FILE,
  vcardExtras,
} from "../../addressBook";
import { getResource, saveResource } from "../../solidClientHelpers/resource";
import { ERROR_CODES, isHTTPError } from "../../error";

/**
 * @typedef AddressBook
 * @type {object}
 * @property {string} containerIri - The address to the container
 * @property {object} index - The main index
 * @property {string} index.iri
 * @property {object | null} index.dataset - Might not be loaded, use loadAddressBook to be certain
 * @property {object} groups - The groups index
 * @property {string} groups.iri
 * @property {object | null} groups.dataset - Might not be loaded, use loadAddressBook to be certain
 * @property {object} people - The people index
 * @property {string} people.iri
 * @property {object | null} people.dataset - Might not be loaded, use loadAddressBook to be certain
 */

/* Model functions */
export function getAddressBookMainIndexUrl(containerIri) {
  return joinPath(containerIri, INDEX_FILE);
}

export function getAddressBookGroupIndexUrl(containerIri) {
  return joinPath(containerIri, GROUPS_INDEX_FILE);
}

export function getAddressBookPersonIndexUrl(containerIri) {
  return joinPath(containerIri, PEOPLE_INDEX_FILE);
}

export function createAddressBook({ containerIri, owner, title = "Contacts" }) {
  const indexIri = getAddressBookMainIndexUrl(containerIri);
  const peopleIri = getAddressBookPersonIndexUrl(containerIri);
  const groupsIri = getAddressBookGroupIndexUrl(containerIri);

  return {
    containerIri,
    index: {
      iri: `${indexIri}#this`,
      dataset: defineDataset(
        { name: "this" },
        (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
        (t) => addUrl(t, acl.owner, owner),
        (t) => addStringNoLocale(t, dc.title, title),
        (t) => addUrl(t, vcardExtras("nameEmailIndex"), peopleIri),
        (t) => addUrl(t, vcardExtras("groupIndex"), groupsIri)
      ),
    },
    groups: {
      iri: groupsIri,
      dataset: createSolidDataset(),
    },
    people: {
      iri: peopleIri,
      dataset: createSolidDataset(),
    },
  };
}

export function getAddressBookIndex(addressBook, type) {
  switch (type) {
    case foaf.Person:
    case schema.Person:
      return addressBook.people;
    default:
      return addressBook.index;
  }
}

export async function loadAddressBook(containerIri, fetch) {
  const mainIndexUrl = getAddressBookMainIndexUrl(containerIri);
  const mainIndexDataset = await getSolidDataset(mainIndexUrl, { fetch });
  const mainIndexThingUrl = `${mainIndexUrl}#this`;
  const mainIndex = getThing(mainIndexDataset, mainIndexThingUrl);
  if (!mainIndex) {
    throw new Error("Unable to load main index");
  }
  const groupsIndexUrl =
    getUrl(mainIndex, vcardExtras("groupIndex")) ||
    getAddressBookGroupIndexUrl(containerIri);
  const peopleIndexUrl =
    getUrl(mainIndex, vcardExtras("nameEmailIndex")) ||
    getAddressBookPersonIndexUrl(containerIri);
  const [groupsDataset, peopleDataset] = await Promise.all([
    getSolidDataset(groupsIndexUrl, { fetch }),
    getSolidDataset(peopleIndexUrl, { fetch }),
  ]);
  return {
    containerIri,
    index: {
      iri: mainIndexThingUrl,
      dataset: mainIndexDataset,
    },
    groups: {
      iri: groupsIndexUrl,
      dataset: groupsDataset,
    },
    people: {
      iri: peopleIndexUrl,
      dataset: peopleDataset,
    },
  };
}

export async function saveNewAddressBook(
  { containerIri, owner, title = "Contacts" },
  fetch
) {
  const { response: existingAddressBook } = await getResource(
    containerIri,
    fetch
  );
  const respondWithError = (error) => {
    if (isHTTPError(error, ERROR_CODES.UNAUTHORIZED)) {
      throw new Error("You do not have permission to create an address book");
    }
    throw error;
  };

  if (existingAddressBook) throw new Error("Address book already exists.");

  const newAddressBook = createAddressBook({
    containerIri,
    owner,
    title,
  });

  const { response: index, error: saveIndexError } = await saveResource(
    newAddressBook.index,
    fetch
  );
  const { response: groups, error: saveGroupsError } = await saveResource(
    newAddressBook.groups,
    fetch
  );
  const { response: people, error: savePeopleError } = await saveResource(
    newAddressBook.people,
    fetch
  );

  if (saveIndexError || saveGroupsError || savePeopleError) {
    return respondWithError(
      saveIndexError || saveGroupsError || savePeopleError
    );
  }

  return { containerIri, index, groups, people };
}
