# Shapes

## Bookmarks

We've decided to keep the structure of bookmarks simple, only storing `terms:created`, `terms:title`, and 
`bookmark:recalls`. Note that some Solid bookmarking apps also use `foaf:maker`, but we didn't think it necessary in the
context of the PodBrowser, so we've chosen to make it optional.

We've also decided to omit the use of an index using `dct:references`, as this would require us to keep the index 
up-to-date manually, and we think it's better to find the bookmarks using the `bookmark:Bookmark` class. 

At some point we might need to group bookmarks, but at this point we've chosen to keep it simple and simply
implement bookmarks as a set of bookmarks that are stored in one file.

## Contacts

Because there are some differences between the ShEx shapes we've described and previous work on SHACL shapes we wanted 
to explain the differences those shapes. Once they have been resolved, we might remove this README altogether.

### Address Book: Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differs from the ShEx shape in `contacts/address-book.shex`.

- vcard:AddressBook
  - vcard:fn (instead of dc:title)
    - There can be one or more instances
  - vcard:nameEmailIndex
    - There can be one or more instances
    - There is not a specific datatype set
  - vcard:vcard:groupIndex
    - Using terms (sh:count, sh:FollowMe) that isn't formalized
    
### Group Index: Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/group-index.shex`.

- vcard:AddressBook
  - vcard:fn
    - Different cardinality ({1,m} vs {1,1})
  - vcard:includesGroup
    - We used an inverse triple constraint instead (putting this term under vcard:Group shape instead)

### Group: Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/group.shex`.

- vcard:AddressBook
  - vcard:includesGroup
    - Using informal terms (sh:count, sh:FollowMe)
- vcard:Group
  - vcard:fn cardinality difference (one or more instead of just one)
  - vcard:member (informal term) instead of vcard:hasMember 
    
### People Index: Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/people-index.shex`.

- vcard:Individual
  - vcard:inAddressBook
    - uses informal term sh:BackwardLink
    - minimum and maximum one instance of IRI (can be part of only one address book)

### Person: Differences between ShEx and SHACL

The following is how the SHACL shape in `https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl` differ from the ShEx shape in `contacts/person.shex`.

- vcard:Individual
  - is closed
  - using informal term sh:count
  - vcard:fn
    - uses sh:pattern ".* .*"
  - vcard:hasUID
    - different cardinality ({1, 1} vs {0, 1})
    - uses sh:pattern "^urn:uuid:"
  - vcard:hasName
    - has a shape of its own (:NameShape)
      - vcard:family-name
      - vcard:given-name
      - vcard:additional-name
      - vcard:honorific-prefix
      - vcard:honorific-suffix
    - we used string, but added a comment
  - vcard:hasImage
    - don't specify type dc:Image
  - vcard:hasRelated
    - don't specify node or sub-shape (we specified a shape for vcard:RelatedType in ShEx)
  - vcard:url
    - has a shape of its own (:WebPageShape)
      - uses vcard:value (vs rdf:value)
      - uses sh:pattern "^https?:"
      - uses informal term sh:count
    - we specified type rdf:Resource in the ShEx shape
  - vcard:hasAddress
    - don't specify node or sub-shape (vcard:Address)
  - vcard:anniversary
    - we used vcard:bday in the ShEx shape
  - vcard:hasEmail
    - uses sh:pattern "^mailto:" (vs /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ in ShEx)
    - uses vcard:value (vs rdf:value)
    - uses informal term sh:count
    - different cardinality (ShEx is *)
  - vcard:hasTelephone
    - uses sh:pattern "^tel:" (vs /^\+?[0-9]+[0-9-]*[0-9]$/ in ShEx)
    - uses vcard:value (vs rdf:value)
    - uses informal term sh:count
    - different cardinality (ShEx is *)
