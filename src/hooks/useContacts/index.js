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

import { useSession } from "@inrupt/solid-ui-react";
import useSWR from "swr";
import { thingAsMarkdown } from "@inrupt/solid-client";
import useAddressBook from "../useAddressBook";
import { getContactAll } from "../../models/contact";
import { compareArray } from "../../models/array";

function reduceToString(array) {
  return array.reduce(
    (memo, item) => memo.concat(thingAsMarkdown(item.thing)),
    ""
  );
}

export default function useContacts(types) {
  const { fetch } = useSession();
  const { data: addressBook, error: addressBookError } = useAddressBook();
  return useSWR(
    ["contacts", addressBook, ...types],
    async () => {
      if (!addressBook && !addressBookError) return null;
      if (addressBookError) throw addressBookError;
      return getContactAll(addressBook, types, fetch);
    },
    {
      // revalidateOnMount: true,
      // revalidateOnFocus: false,
      // revalidateOnReconnect: false,
      // refreshInterval: 0,
      shouldRetryOnError: false,
      // errorRetryCount: 0,
      compare: (a, b) =>
        compareArray(a, b, (c, d) => reduceToString(c) === reduceToString(d)),
      // compare: (a, b) => {
      //   if (typeof a === "undefined") {
      //     return typeof b === "undefined";
      //   }
      //   if (typeof b === "undefined") {
      //     return typeof a === "undefined";
      //   }
      //   if (!Array.isArray(a) || !Array.isArray(b)) {
      //     return false;
      //   }
      //   if (a.length !== b.length) {
      //     return false;
      //   }
      //   const reduce = reduceToString(a) === reduceToString(b);
      //   // if (!reduce) {
      //   //   console.log("COMPARE ARRAY A", reduceToString(a));
      //   //   console.log("COMPARE ARRAY B", reduceToString(b));
      //   // }
      //   return reduce;
      // },
    }
  );
}
