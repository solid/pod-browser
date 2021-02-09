# Shapes

This document describes the overall contents of this Shape directory, and
attempts to explain some of the rationale for the modelling.

## Use of triples versus quads for user data

Currently our modelling does not use quads for user data at all.

Instead we propose to use Named Graphs to support various forms of meta-data
that might be associated with any resource, for example, server-managed
meta-data (e.g., the date/time the resource was created or last modified, or
the backend storage node used, etc.), or Access Control List (ACL) data
associated with the resource, or perhaps ShEx shapes the resource must conform
to, or client-side meta-data associated with Non-RDF resources (e.g., the 'name'
of a JPEG image resource, or the camera aperture settings of the image), etc.

## Structure of the Shapes, and example Turtle contained here.

This directory contains a `bookmark` directory and a `contact` directory. Each
contains ShEx Shapes and an `/example` folder showing demonstration Turtle files
conforming to the relevant Shapes.

The Turtle files of the `contact` examples also demonstrate how instances of Pod
Resources are currently interlinked (e.g., it demonstrates groups of people
referenced from address books).

## Use of the `#this` fragment identifier

This modelling follows a naming convention whereby the fragment identifier
`#this` can be used to denote the main RDF Subject in the dataset that makes up
all the triples of a single Pod resource.

For example, in `shapes/contact/example/group/group3-soccer-team.ttl` we use the
`#this` fragment identifier on the RDF Subject of the triples associated with
the Soccer Team Group itself. The resource is free to include triples using as
many other RDF Subjects as it likes, but `#this` is intended to identify the
main entity of the resource.

## Indexes

We use the term 'index' throughout our modelling with two very different
interpretations:

 - Index in the sense of a single Pod resource containing a collection of
   entities. E.g., a single Person-Index resource might contain a list of 50
   Person instances, where each instance contains a reference (or link) to the
   actual Person resource elsewhere in my Pod, but may also contain a copy of
   the Person's name and profile image perhaps, directly in the index too.
 - Index in the sense of a '_default resource to look for when navigating to a
   Container_'. In much the same way as browsers will automatically look for a
   resource named 'index.html' when browsing to a website, our modelling can
   store resources named 'index.ttl' in the root of containers, which our
   applications can then expect to contain app-specific information.

### Indexes as 'efficient containers for a collection of entities'

We chose not to model these collections using either native RDF lists (e.g.,
`rdf:Seq`), nor LDP containers, nor some existing list or set vocabulary (e.g.,
such as Schema.org's [ItemList](https://schema.org/ItemList), or the Ordered
List Ontology ([OLO](http://smiy.sourceforge.net/olo/spec/orderedlistontology.html))).
The reasons for this were:
 - This was originally modelled around limitations of the first Solid server
   (NSS).
 - Efficiency reasons, i.e.,  where we wish to retrieve a collection of entities
   in a single HTTP resource request (e.g., a list of people, perhaps with just
   their first name and date-of-birth values), as opposed to needing to make
   multiple HTTP requests, one for each Person resource in our list.


#### Example of index use

For example, a single AddressBook resource may reference two indexes, one for
the collection of email addresses in that AddressBook (i.e., using the
predicate `vcard:nameEmailIndex`), and one for the collection of groups in that
AddressBook (i.e., using the predicate `vcard:groupIndex`).


## Bookmarks

We've decided to keep the structure of bookmarks simple, only storing
`dcterms:created`, `dcterms:title`, and `bookmark:recalls`. Note that some Solid
bookmarking apps also use `foaf:maker`, but we didn't think it necessary in the
context of the PodBrowser, so we've chosen to make it optional.

We've also decided to omit the use of an index using `dcterms:references`, as
this would require us to keep the index up-to-date manually, and we think it's
better to find the bookmarks using the `bookmark:Bookmark` class. 

At some point we might need to group bookmarks, but at this point we've chosen
to keep it simple and simply implement bookmarks as a set of bookmarks that are
stored in one file.

## Contacts

Because there are some differences between the ShEx shapes we've described and
previous work on SHACL shapes, we wanted to explain the differences between
those shapes. Once these differences have all been resolved, we might remove
this README altogether.

### Address Book: Differences between ShEx and SHACL

The following is how the SHACL shape in
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl`
differs from the ShEx shape in `contacts/address-book.shex`.

- vcard:AddressBook
  - vcard:fn (instead of dc:title)
    - There can be one or more instances.
  - vcard:nameEmailIndex
    - There can be one or more instances.
    - There is no specific datatype set.
  - vcard:groupIndex
    - Uses terms (e.g., sh:count, sh:FollowMe) that aren't formalized.
    
### Group Index: Differences between ShEx and SHACL

The following is how the SHACL shape in
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl`
differs from the ShEx shape in `contacts/group-index.shex`.

- vcard:AddressBook
  - vcard:fn
    - Different cardinality ({1,m} vs {1,1}).
  - vcard:includesGroup
    - We used an inverse triple constraint instead (putting this term under
      vcard:Group shape instead).

### Group: Differences between ShEx and SHACL

The following is how the SHACL shape in
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl`
differs from the ShEx shape in `contacts/group.shex`.

- vcard:AddressBook
  - vcard:includesGroup
    - Using informal terms (sh:count, sh:FollowMe).
- vcard:Group
  - vcard:fn cardinality difference (one or more instead of just one).
  - vcard:member (informal term) instead of vcard:hasMember.
    
### People Index: Differences between ShEx and SHACL

The following is how the SHACL shape in
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl`
differs from the ShEx shape in `contacts/person-index.shex`.

- vcard:Individual
  - vcard:inAddressBook
    - uses informal term sh:BackwardLink.
    - minimum and maximum one instance of IRI (i.e., can only be referenced from
      one address book).

### Person: Differences between ShEx and SHACL

The following is how the SHACL shape in
`https://raw.githubusercontent.com/solid/contacts-pane/master/shapes/contacts-shapes.ttl`
differs from the ShEx shape in `contacts/person.shex`.

- vcard:Individual
  - is closed.
  - using informal term sh:count.
  - vcard:fn
    - uses sh:pattern ".* .*".
  - vcard:hasUID
    - different cardinality ({1, 1} vs {0, 1}).
    - uses sh:pattern "^urn:uuid:".
  - vcard:hasName
    - has a shape of its own (:NameShape):
      - vcard:family-name
      - vcard:given-name
      - vcard:additional-name
      - vcard:honorific-prefix
      - vcard:honorific-suffix
    - we used string, but added a comment.
  - vcard:hasImage
    - don't specify type dc:Image.
  - vcard:hasRelated
    - don't specify node or sub-shape (we specified a shape for
      vcard:RelatedType in ShEx).
  - vcard:url
    - has a shape of its own (:WebPageShape):
      - uses vcard:value (vs rdf:value).
      - uses sh:pattern "^https?:".
      - uses informal term sh:count.
    - we specified type rdf:Resource in the ShEx shape.
  - vcard:hasAddress
    - don't specify node or sub-shape (vcard:Address).
  - vcard:anniversary
    - we used vcard:bday in the ShEx shape.
  - vcard:hasEmail
    - uses sh:pattern "^mailto:" (vs /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ in ShEx).
    - uses vcard:value (vs rdf:value).
    - uses informal term sh:count.
    - different cardinality (ShEx is *).
  - vcard:hasTelephone
    - uses sh:pattern "^tel:" (vs /^\+?[0-9]+[0-9-]*[0-9]$/ in ShEx).
    - uses vcard:value (vs rdf:value).
    - uses informal term sh:count.
    - different cardinality (ShEx is *).
