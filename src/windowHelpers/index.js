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

// A helper function to generate a full redirect url to a given path, using the current
// domain and protocol.
export function generateRedirectUrl(path) {
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    return `${currentOrigin}/${path}`;
  }

  return "";
}

export function getCurrentHostname() {
  return typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "";
}

export function hardRedirect(path) {
  window.location.href = path;
}

export function getFakeLocalStorage() {
  let memoryStore = {};
  return {
    getItem: (key) => memoryStore[key] ?? null,
    setItem: (key, value) => {
      memoryStore[key] = value.toString();
    },
    removeItem: (key) => {
      delete memoryStore[key];
    },
    clear: () => {
      memoryStore = {};
    },
  };
}

export function getLocalStorage() {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return getFakeLocalStorage();
}

export function getFakeConsole() {
  const noop = () => {};
  return {
    assert: noop,
    clear: noop,
    count: noop,
    countReset: noop,
    debug: noop,
    dir: noop,
    dirxml: noop,
    error: noop,
    group: noop,
    groupEnd: noop,
    info: noop,
    log: noop,
    table: noop,
    time: noop,
    timeEnd: noop,
    timeLog: noop,
    trace: noop,
    warn: noop,
  };
}

export function getConsole() {
  if (typeof window !== "undefined") {
    return window.console;
  }
  return getFakeConsole();
}
