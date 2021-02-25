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

import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { getContactIndexDefaultUrl } from "../src/models/contact/collection";
import { addGroupToMockedIndexDataset } from "./mockGroupContact";
import { getGroupName, getGroupUrl } from "../src/models/group";
import { chain } from "../src/solidClientHelpers/utils";
import { GROUP_CONTACT } from "../src/models/contact/group";

export default function mockGroupIndex(addressBook, groups) {
  const contactIndexUrl = getContactIndexDefaultUrl(
    addressBook.containerUrl,
    GROUP_CONTACT
  );
  return {
    dataset: chain(
      mockSolidDatasetFrom(contactIndexUrl),
      ...groups.map((g) => (d) =>
        addGroupToMockedIndexDataset(
          d,
          addressBook,
          getGroupName(g),
          getGroupUrl(g)
        )
      )
    ),
    type: GROUP_CONTACT,
  };
}
