# Shapes

Because there were some differences between the shapes we've described and the work in 
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` we wanted to describe the
ShEx shapes we've described here and the SHACL shapes. Once they have been resolved, we might remove this README
altogether (the ShEx shapes should be easy to read).

## Address Book (in the context of Contacts)

Our understanding of the ShEx shape described in `contacts/address-book.shex`.

- vcard:AddressBook
  - dc:title denotes the title of the Address Book
    - should be only one instance of string
  - vcard:nameEmailIndex denotes where the email index of the Address Book is
    - should be only one instance of IRI
  - vcard:groupIndex denotes where the group index of the Address Book is
    - should be only one instance of IRI

### Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/address-book.shex`.

- vcard:AddressBook
  - vcard:fn (instead of dc:title)
    - There can be one or more instances
  - vcard:nameEmailIndex
    - There can be one or more instances
    - There is not a specific datatype set
  - vcard:vcard:groupIndex
    - Using terms (sh:count, sh:FollowMe) that isn't formalized
    
## Group Index (in the context of Contacts)

Our understanding of the ShEx shape described in `contacts/address-book.shex`.

- vcard:AddressBook
  - vcard:includesGroup denotes a group that belongs to the Address Book
    - There can be zero or more instances of IRI
    
### Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/address-book.shex`.

- No shape describing group index and address book.

## Group (in the context of Contacts)

Our understanding of the ShEx shapes described in `contacts/group.shex`.

- for subjects of type vcard:AddressBook
  - vcard:includesGroup denotes a group that belongs to the Address Book
    - should be at least one instance of IRI

### Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/group.shex`.

- vcard:AddressBook
  - vcard:includesGroup
    - Using terms (sh:count, sh:FollowMe) that isn't formalized
    
## People Index (in the context of Contacts)

Our understanding of the ShEx shapes described in `contacts/people-index.shex`.

- vcard:Individual
  - vcard:inAddressBook denotes an address book that the individual is part of
    - should be at least one instance of IRI (a person can be added to multiple address books)

### Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/address-book.shex`.

- vcard:Individual
  - vcard:inAddressBook
    - minimum and maximum one instance of IRI (can be part of only one address book)

## Person (in the context of Contacts)

No shape yet
