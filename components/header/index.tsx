import React from 'react';
import { Link } from '@material-ui/core';
import LogOutButton from '../logout';
// import { images, mainNav } from '../../lib/prism/packages/prism-patterns';

export default function Header() {
  return (
    <nav>
      <Link>Inrupt</Link>
      <Link>
        <i className="prism-icon-add" />
      </Link>
      <LogOutButton />
    </nav>
  );
}
