import React from 'react';
import Router from 'next/router';
import { Button } from '@material-ui/core';

import { logout } from '../../lib/solid-auth-fetcher/dist';


export function onLogOutClick(e: React.SyntheticEvent<EventTarget>) {
  e.preventDefault();
  logout();
  Router.push('/login');
}

export default function LogOut() {
  return (
    <Button onClick={onLogOutClick}>Log out</Button>
  );
}
