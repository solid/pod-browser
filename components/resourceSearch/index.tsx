import React, { useState, useContext } from 'react';

export default function ResourceSearch({ searchResources }) {
  const [searchText, setSearchText] = useState('');

  // TODO not sure if we want to change on submit or while typing
  // TODO also want to look into the resources.. right now it's the whole
  // path with https.. this knowledge is needed to determine how to implement search
  const onInputChange = (e) => {
    e.preventDefault();
    setSearchText(e.target.value);
    searchResources(searchText);
  };
  return (
    <div>
      <form>
        <div>
          <label></label>
          <input
            type="text"
            name="searchText"
            placeholder="Search All Files"
            value={searchText}
            onChange={onInputChange}
          />
        </div>
      </form>
    </div>
  );
}
