# pod-browser

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

This project adheres to the Contributor Covenant [code of conduct](code_of_conduct.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [engineering@inrupt.com](mailto:engineering@inrupt.com).

An application for browsing the data on your Solid pod, and for setting ACLs on
that data.


# Installation

1. `npm install`
1. Copy `.env-example` into `.env.local` and update any variables you need.
1. `npm run dev` to run a dev server, or `npm run build` to compile static html
  and other assets.

# Development

* PodBrowser uses a framework called [Next.js](https://nextjs.org/), which has
  [extensive documentation](https://nextjs.org/docs/getting-started). It uses
  React for client-side templates, Webpack for building assets, Typescript for
  javascript, and Jest for tests.
* Any environment variables you wish to expose must be added to next.config.js.


# Deployment

You can use `npm deploy` to deploy a PodBrowser instance to Vercel, if you
create an account. Alternatively, you can:

* Run `npm run build` and `npm run start` to run the node server;
* Run `npm run build` and `npm run export` to export static HTML and assets
  to host on the server of your choice.


# Notes

* prism is temporarily a submodule under lib/* until it's published as an npm module.
