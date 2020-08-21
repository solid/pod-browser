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

import auth from "solid-auth-client";

/* eslint class-methods-use-this: 0 */

export default class SessionWrapper {
  login({ oidcIssuer }) {
    return auth.login(oidcIssuer);
  }

  async logout() {
    await auth.logout();
    this.info = this.defaultInfo();
  }

  fetch(...args) {
    return auth.fetch(...args);
  }

  // Quiet down eslint so that the interface more closely matches.
  /* eslint no-unused-vars: 0 */
  handleIncomingRedirect(location) {
    return this.loadCurrentSession();
  }

  defaultInfo = () => ({
    isLoggedIn: false,
    webId: undefined,
  });

  loadCurrentSession = async () => {
    const session = await auth.currentSession();

    if (session) {
      this.info = {
        webId: session.webId,
        isLoggedIn: true,
      };
    } else {
      this.info = this.defaultInfo();
    }
  };

  constructor() {
    this.info = this.defaultInfo();
  }
}
