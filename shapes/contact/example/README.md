# Contacts-related Turtle files

The example Turtle files here describe the structure and modelling of the
following Contact-related concepts:

### Two address books

Modelled as **_containers_**:

- Work colleagues (the `/addressBookWork` container).
- Friends (the `/addressBookFriend` container).

### Four groups

Modelled as individual **_resources_** within the `/group` container, and with
that `/group` container having an `index.ttl` Group-Index.

- Work colleagues (`/group/group1-work-colleague.ttl`).
- Friends (`/group/group2-friend.ttl`).
- Local soccer team (`/group/group3-soccer-team.ttl`).
- Just an empty group (`/group/group4-empty.ttl`).

And the Group-Index - `/group/index.ttl`.

### Three people

Each person modelled as a **_child container_** within the `/person` container,
with the parent `/person` container containing an `index.ttl` Person-Index.

- Arne H, who I work with, is a friend I play D&G, and is the striker on my
  local soccer team!
- Vincent T, who I work with.
- Tommy Mc, who is a friend.

And the Person-Index - `/person/index.ttl`.


# Notes:

- The use of `index.ttl` is a convention, but it seems to be used for both
  'indexes' (i.e., a Group index (e.g., `/group/index.ttl`) listing a number of
  contained groups), and the 'default resource' of a container (e.g., the
  `index.ttl` resource within the individual person container (e.g., 
  `/person/347429c1-e6b5-40c0-bd6f-61ba1265d357/index.ttl`).

- In Group-Indexes, is it necessary to duplicate the triple stating that each
  contained group is of `rdf:type` `vcard:Group`?
