<img src="public/inrupt_logo-2020.svg" alt="Inrupt Logo" width="200"/>

# PodBrowser

## A modular tool to view, manage, and control access to you Pod.

[podbrowser.inrupt.com](https://podbrowser.inrupt.com)

[Code of Conduct](code-of-conduct.md) · [Documentation](https://docs.inrupt.com/user-interface/podbrowser/) · [Support](https://inrupt.atlassian.net/servicedesk/customer/portals) 

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)
![](https://img.shields.io/github/stars/inrupt/pod-browser.svg)
![](https://img.shields.io/github/forks/inrupt/pod-browser.svg)
![](https://img.shields.io/github/watchers/inrupt/pod-browser.svg)
![](https://img.shields.io/github/issues/inrupt/pod-browser.svg)
![](https://img.shields.io/github/issues-pr/inrupt/pod-browser.svg)
[![](https://img.shields.io/github/contributors/inrupt/pod-browser.svg)](https://github.com/inrupt/pod-browser/graphs/contributors)
![](https://img.shields.io/github/license/inrupt/pod-browser.svg)

This project adheres to the Contributor Covenant [code of conduct](code_of_conduct.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [engineering@inrupt.com](mailto:engineering@inrupt.com).


# Installation

1. `npm install`
2. `npm run dev` to run a dev server, or `npm run build` to compile static html
  and other assets.

# Development

* PodBrowser uses a framework called [Next.js](https://nextjs.org/), which has
  [extensive documentation](https://nextjs.org/docs/getting-started). It uses
  [React](https://reactjs.org/) for client-side templates, [Webpack](https://webpack.js.org/) for building assets, and [Jest](https://jestjs.io/) for tests.
* Any environment variables you wish to expose must be added to next.config.js.


# Deployment

You can use `npm deploy` to deploy a PodBrowser instance to Vercel, if you
create an account. Alternatively, you can:

* Run `npm run build` and `npm run start` to run the node server;
* Run `npm run build` and `npm run export` to export static HTML and assets
  to host on the server of your choice.

