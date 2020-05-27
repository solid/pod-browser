import React from 'react';
import { Link } from '@material-ui/core';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import LogOutButton from '../../components/logout';

export default function Header() {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link>Inrupt</Link>
      <LogOutButton />
    </Breadcrumbs>
  );
}
