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

import React, { useContext } from "react";
import { render } from "@testing-library/react";
import useAddressBook from "../../hooks/useAddressBook";
import AddressBookContext, { AddressBookProvider } from "./index";

jest.mock("../../hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

const TESTID = "test";

function ChildComponent() {
  const addressBook = useContext(AddressBookContext);
  return <div data-testid={TESTID}>{addressBook}</div>;
}

describe("AddressBookContext", () => {
  it("exposes whatever useAddressBook returns", () => {
    const addressBook = "test";
    mockedAddressBookHook.mockReturnValue(addressBook);
    const { getByTestId } = render(
      <AddressBookProvider>
        <ChildComponent />
      </AddressBookProvider>
    );
    expect(getByTestId(TESTID).innerHTML).toEqual(addressBook);
    expect(mockedAddressBookHook).toHaveBeenCalledWith();
  });
});
