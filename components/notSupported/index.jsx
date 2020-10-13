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

import { Container, Content, PageHeader } from "@inrupt/prism-react-components";
import React from "react";
import { useRouter } from "next/router";

export default function NotSupported() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Resource Not Supported" />
      <Container>
        <Content>
          <p>PodBrowser can only show resources that are Solid containers.</p>
          <p>
            <span>
              Navigate to the resource directly (this will navigate away from
              PodBrowser):&nbsp;
            </span>
            <a href={router.query.iri}>{router.query.iri}</a>
          </p>
        </Content>
      </Container>
    </>
  );
}
