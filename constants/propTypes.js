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

import PropTypes from "prop-types";

export const permission = PropTypes.shape({
  type: PropTypes.string,
  acl: PropTypes.shape({
    read: PropTypes.bool,
    write: PropTypes.bool,
    append: PropTypes.bool,
    control: PropTypes.bool,
  }),
  webId: PropTypes.string.isRequired,
  alias: PropTypes.string,
  inherited: PropTypes.bool,
  vc: PropTypes.shape({
    "@context": PropTypes.arrayOf(PropTypes.string),
    credentialSubject: PropTypes.shape({
      hasConsent: PropTypes.shape({
        mode: PropTypes.arrayOf(PropTypes.string),
        hasStatus: PropTypes.string,
        forPersonalData: PropTypes.arrayOf(PropTypes.string),
        forPurpose: PropTypes.arrayOf(PropTypes.string),
        isProvidedTo: PropTypes.string,
      }),
      id: PropTypes.string,
      inbox: PropTypes.string,
    }),
    id: PropTypes.string,
    issuanceDate: PropTypes.string,
    expirationDate: PropTypes.string,
    issuer: PropTypes.string,
    proof: PropTypes.shape({
      created: PropTypes.string,
      domain: PropTypes.string,
      proofPurpose: PropTypes.string,
      proofValue: PropTypes.string,
      type: PropTypes.string,
      verificationMethod: PropTypes.string,
    }),
    type: PropTypes.arrayOf(PropTypes.string),
  }),
});

export const profile = PropTypes.shape({
  avatar: PropTypes.string,
  name: PropTypes.string,
  nickname: PropTypes.string,
  webId: PropTypes.string,
  types: PropTypes.arrayOf(PropTypes.string),
});

export const swrResponse = PropTypes.shape({
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.object,
  isValidating: PropTypes.bool.isRequired,
  mutate: PropTypes.func.isRequired,
});

export const profilePropTypes = PropTypes.shape({
  names: PropTypes.arrayOf(PropTypes.string),
  avatars: PropTypes.arrayOf(PropTypes.string),
  types: PropTypes.arrayOf(PropTypes.string),
  webId: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
  organizations: PropTypes.arrayOf(PropTypes.string),
  editableProfileDatasets: PropTypes.arrayOf(PropTypes.object),
  contactInfo: PropTypes.shape({
    phones: PropTypes.arrayOf(PropTypes.string),
    emails: PropTypes.arrayOf(PropTypes.string),
  }),
});
