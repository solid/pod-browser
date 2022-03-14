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

/* eslint import/prefer-default-export: 0 */
import getConfig from "./config";
import { isLocalhost } from "../src/stringHelpers";
import {
  generateRedirectUrl,
  getCurrentHostname,
  getCurrentOrigin,
} from "../src/windowHelpers";

export const CLIENT_NAME = "Inrupt PodBrowser";

export const getClientOptions = () => {
  const clientId = isLocalhost(getCurrentHostname())
    ? getConfig().devClientId
    : `${getCurrentOrigin()}/api/app`;

  return {
    clientName: CLIENT_NAME,
    clientId,
    // TODO: Improve redirect url to be something specific:
    redirectUrl: generateRedirectUrl(""),
  };
};
