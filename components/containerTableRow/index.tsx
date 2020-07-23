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

/* eslint-disable camelcase */
import { ReactElement } from "react";
import { makeStyles, createStyles, StyleRules } from "@material-ui/styles";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import { useRouter, NextRouter } from "next/router";
import Link from "next/link";
import clsx from "clsx";
import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";
import { IResourceDetails, isContainerIri } from "../../src/lit-solid-helpers";
import { stripQueryParams } from "../../src/stringHelpers";
import styles from "./styles";

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

interface IResourceIcon {
  iri: string;
  bem: (className: string) => string;
}

export function ResourceIcon({ iri, bem }: IResourceIcon): ReactElement {
  // keeping it very simple for now (either folder or file), and then we can expand upon it later
  const icon = isContainerIri(iri) ? "icon-folder" : "icon-file";

  return <i className={clsx(bem(icon), bem("resource-icon"))} />;
}

export function renderResourceType(iri: string): string {
  return isContainerIri(iri) ? "Container" : "Resource";
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface Props {
  resource: IResourceDetails;
}

export function handleClick(
  iri: string,
  router: NextRouter
): (evnt: Partial<React.MouseEvent>) => Promise<void> {
  const { asPath } = router;
  const pathname = stripQueryParams(asPath);
  const action = DETAILS_CONTEXT_ACTIONS.DETAILS;

  return async (evnt) => {
    const element = evnt.target as HTMLElement;
    if (element && element.tagName === "A") return;

    await router.replace({
      pathname,
      query: { action, iri },
    });
  };
}

export default function ContainerTableRow({ resource }: Props): ReactElement {
  const classes = useStyles();
  const bem = useBem(classes);
  const { name, iri } = resource;
  const router = useRouter();

  return (
    <tr
      className={clsx(bem("table__body-row"), bem("tableRow"))}
      onClick={handleClick(iri, router)}
    >
      <td className={bem("table__body-cell", "align-center", "width-preview")}>
        <ResourceIcon iri={iri} bem={bem} />
      </td>

      <td className={bem("table__body-cell")}>
        <Link href="/resource/[iri]" as={resourceHref(iri)}>
          <a>{name}</a>
        </Link>
      </td>

      <td key={`${iri}-type`} className={bem("table__body-cell")}>
        {renderResourceType(iri)}
      </td>
    </tr>
  );
}
