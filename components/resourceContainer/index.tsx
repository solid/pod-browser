import React, { useContext } from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {UserContext} from "../../src/contexts/UserContext";
import ResourceSearch from '../resourceSearch/index';

export default function ResourceContainer({ containerIri }) {
    const { resources } = useContext(UserContext);
const searchResources = () => {

}

    return (
        <>
            <ResourceSearch searchResources={searchResources} />
            { resources && resources.length ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>File</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>My Access</TableCell>
                            <TableCell>Modified</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        { resources.map((iri: string) => (
                            <TableRow key={iri}>
                                <TableCell>
                                    <a href={`/resource/${iri}`}>
                                        {iri.replace(containerIri, '')}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    Folder
                                </TableCell>
                                <TableCell>
                                    Full
                                </TableCell>
                                <TableCell>
                                    Today :)
                                </TableCell>
                            </TableRow>
                        )) }
                    </TableBody>
                </Table>
            ) : null}
        </>
    );

}