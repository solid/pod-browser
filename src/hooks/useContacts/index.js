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

import useSWR from "swr";
import { useSession } from "@inrupt/solid-ui-react";
import { getSolidDataset } from "@inrupt/solid-client";
import { getContacts, TYPE_MAP } from "../../addressBook";
import { getAddressBookIndex } from "../../models/addressBook";

export default function useContacts(addressBook, type) {
  const { fetch } = useSession();
  return useSWR(["contacts", addressBook], async () => {
    if (!addressBook) return [];
    const { contactTypeIri } = TYPE_MAP[type];
    const { iri } = getAddressBookIndex(addressBook, type);
    // TODO: Want to move this into smarter loading features w/useAddressBook, but waiting because it's a bit too complex for now
    // Need to do it like this to be able to only load the people index when mutating or revalidating
    const dataset = await getSolidDataset(iri, { fetch });
    return getContacts(dataset, contactTypeIri, fetch);
  });
}
