initSidebarItems({"enum":[["AccessControlAllowOrigin","The `Access-Control-Allow-Origin` response header, part of CORSThe `Access-Control-Allow-Origin` header indicates whether a resource can be shared based by returning the value of the Origin request header, \"*\", or \"null\" in the response.ABNFExample values`null` `*` `http://google.com/` Examples"],["ByteRangeSpec","Each Range::Bytes header can contain one or more ByteRangeSpecs. Each ByteRangeSpec defines a range of bytes to fetch"],["CacheDirective","CacheControl contains a list of these directives."],["ConnectionOption","Values that can be in the `Connection` header."],["ContentRangeSpec","Content-Range, described in RFC7233ABNF"],["DispositionParam","A parameter to the disposition type"],["DispositionType","The implied disposition of the content of the HTTP body"],["Expect","The `Expect` header.The \"Expect\" header field in a request indicates a certain set of behaviors (expectations) that need to be supported by the server in order to properly handle this request.  The only such expectation defined by this specification is 100-continue.   Expect  = \"100-continue\"Example"],["IfMatch","`If-Match` header, defined in RFC7232The `If-Match` header field makes the request method conditional on the recipient origin server either having at least one current representation of the target resource, when the field-value is \"*\", or having a current representation of the target resource that has an entity-tag matching a member of the list of entity-tags provided in the field-value.An origin server MUST use the strong comparison function when comparing entity-tags for `If-Match`, since the client intends this precondition to prevent the method from being applied if there have been any changes to the representation data.ABNFExample values`\"xyzzy\"` \"xyzzy\", \"r2d2xxxx\", \"c3piozzzz\" Examples"],["IfNoneMatch","`If-None-Match` header, defined in RFC7232The `If-None-Match` header field makes the request method conditional on a recipient cache or origin server either not having any current representation of the target resource, when the field-value is \"*\", or having a selected representation with an entity-tag that does not match any of those listed in the field-value.A recipient MUST use the weak comparison function when comparing entity-tags for If-None-Match (Section 2.3.2), since weak entity-tags can be used for cache validation even if there have been changes to the representation data.ABNFExample values`\"xyzzy\"` `W/\"xyzzy\"` `\"xyzzy\", \"r2d2xxxx\", \"c3piozzzz\"` `W/\"xyzzy\", W/\"r2d2xxxx\", W/\"c3piozzzz\"` `*` Examples"],["IfRange","`If-Range` header, defined in RFC7233If a client has a partial copy of a representation and wishes to have an up-to-date copy of the entire representation, it could use the Range header field with a conditional GET (using either or both of If-Unmodified-Since and If-Match.)  However, if the precondition fails because the representation has been modified, the client would then have to make a second request to obtain the entire current representation.The `If-Range` header field allows a client to \"short-circuit\" the second request.  Informally, its meaning is as follows: if the representation is unchanged, send me the part(s) that I am requesting in Range; otherwise, send me the entire representation.ABNFExample values`Sat, 29 Oct 1994 19:43:31 GMT` `\"xyzzy\"` Examples"],["Pragma","The `Pragma` header defined by HTTP/1.0.The \"Pragma\" header field allows backwards compatibility with HTTP/1.0 caches, so that clients can specify a \"no-cache\" request that they will understand (as Cache-Control was not defined until HTTP/1.1).  When the Cache-Control header field is also present and understood in a request, Pragma is ignored. In HTTP/1.0, Pragma was defined as an extensible field for implementation-specified directives for recipients.  This specification deprecates such extensions to improve interoperability.Spec: https://tools.ietf.org/html/rfc7234#section-5.4Examples"],["ProtocolName","A protocol name used to identify a spefic protocol. Names are case-sensitive except for the `WebSocket` value."],["Range","`Range` header, defined in RFC7233The \"Range\" header field on a GET request modifies the method semantics to request transfer of only one or more subranges of the selected representation data, rather than the entire selected representation data.ABNFExample values`bytes=1000-` `bytes=-2000` `bytes=0-1,30-40` `bytes=0-10,20-90,-100` `custom_unit=0-123` `custom_unit=xxx-yyy` Examples"],["RangeUnit","Range Units, described in RFC7233A representation can be partitioned into subranges according to various structural units, depending on the structure inherent in the representation's media type.ABNF"],["Vary","`Vary` header, defined in RFC7231The \"Vary\" header field in a response describes what parts of a request message, aside from the method, Host header field, and request target, might influence the origin server's process for selecting and representing this response.  The value consists of either a single asterisk (\"*\") or a list of header field names (case-insensitive).ABNFExample values`accept-encoding, accept-language` ExampleExample"]],"struct":[["Accept","`Accept` header, defined in RFC7231The `Accept` header field can be used by user agents to specify response media types that are acceptable.  Accept header fields can be used to indicate that the request is specifically limited to a small set of desired types, as in the case of a request for an in-line imageABNFExample values`audio/*; q=0.2, audio/basic` (`*` value won't parse correctly) `text/plain; q=0.5, text/html, text/x-dvi; q=0.8, text/x-c` ExamplesNotesUsing always Mime types to represent `media-range` differs from the ABNF. **FIXME**: `accept-ext` is not supported."],["AcceptCharset","`Accept-Charset` header, defined in RFC7231The `Accept-Charset` header field can be sent by a user agent to indicate what charsets are acceptable in textual response content. This field allows user agents capable of understanding more comprehensive or special-purpose charsets to signal that capability to an origin server that is capable of representing information in those charsets.ABNFExample values`iso-8859-5, unicode-1-1;q=0.8` Examples"],["AcceptEncoding","`Accept-Encoding` header, defined in RFC7231The `Accept-Encoding` header field can be used by user agents to indicate what response content-codings are acceptable in the response.  An  `identity` token is used as a synonym for \"no encoding\" in order to communicate when no encoding is preferred.ABNFExample values`compress, gzip` `` `*` `compress;q=0.5, gzip;q=1` `gzip;q=1.0, identity; q=0.5, *;q=0` Examples"],["AcceptLanguage","`Accept-Language` header, defined in RFC7231The `Accept-Language` header field can be used by user agents to indicate the set of natural languages that are preferred in the response.ABNFExample values`da, en-gb;q=0.8, en;q=0.7` `en-us;q=1.0, en;q=0.5, fr` Examples"],["AcceptRanges","`Accept-Ranges` header, defined in RFC7233The `Accept-Ranges` header field allows a server to indicate that it supports range requests for the target resource.ABNFExamples"],["AccessControlAllowCredentials","`Access-Control-Allow-Credentials` header, part of CORSThe Access-Control-Allow-Credentials HTTP response header indicates whether the response to request can be exposed when the credentials flag is true. When part of the response to an preflight request it indicates that the actual request can be made with credentials. The Access-Control-Allow-Credentials HTTP header must match the following ABNF:ABNFSince there is only one acceptable field value, the header struct does not accept any values at all. Setting an empty `AccessControlAllowCredentials` header is sufficient. See the examples below.Example values\"true\" Examples"],["AccessControlAllowHeaders","`Access-Control-Allow-Headers` header, part of CORSThe `Access-Control-Allow-Headers` header indicates, as part of the response to a preflight request, which header field names can be used during the actual request.ABNFExample values`accept-language, date` Examples"],["AccessControlAllowMethods","`Access-Control-Allow-Methods` header, part of CORSThe `Access-Control-Allow-Methods` header indicates, as part of the response to a preflight request, which methods can be used during the actual request.ABNFExample values`PUT, DELETE, XMODIFY` Examples"],["AccessControlExposeHeaders","`Access-Control-Expose-Headers` header, part of CORSThe Access-Control-Expose-Headers header indicates which headers are safe to expose to the API of a CORS API specification.ABNFExample values`ETag, Content-Length` Examples"],["AccessControlMaxAge","`Access-Control-Max-Age` header, part of CORSThe `Access-Control-Max-Age` header indicates how long the results of a preflight request can be cached in a preflight result cache.ABNFExample values`531` Examples"],["AccessControlRequestHeaders","`Access-Control-Request-Headers` header, part of CORSThe `Access-Control-Request-Headers` header indicates which headers will be used in the actual request as part of the preflight request. during the actual request.ABNFExample values`accept-language, date` Examples"],["AccessControlRequestMethod","`Access-Control-Request-Method` header, part of CORSThe `Access-Control-Request-Method` header indicates which method will be used in the actual request as part of the preflight request.ABNFExample values`GET` Examples"],["Allow","`Allow` header, defined in RFC7231The `Allow` header field lists the set of methods advertised as supported by the target resource.  The purpose of this field is strictly to inform the recipient of valid request methods associated with the resource.ABNFExample values`GET, HEAD, PUT` `OPTIONS, GET, PUT, POST, DELETE, HEAD, TRACE, CONNECT, PATCH, fOObAr` `` Examples"],["Authorization","`Authorization` header, defined in RFC7235The `Authorization` header field allows a user agent to authenticate itself with an origin server -- usually, but not necessarily, after receiving a 401 (Unauthorized) response.  Its value consists of credentials containing the authentication information of the user agent for the realm of the resource being requested.ABNFExample values`Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==` `Bearer fpKL54jvWmEGVoRdCNjG` Examples"],["Basic","Credential holder for Basic Authentication"],["Bearer","Token holder for Bearer Authentication, most often seen with oauth"],["CacheControl","`Cache-Control` header, defined in RFC7234The `Cache-Control` header field is used to specify directives for caches along the request/response chain.  Such cache directives are unidirectional in that the presence of a directive in a request does not imply that the same directive is to be given in the response.ABNFExample values`no-cache` `private, community=\"UCI\"` `max-age=30` Examples"],["Connection","`Connection` header, defined in RFC7230The `Connection` header field allows the sender to indicate desired control options for the current connection.  In order to avoid confusing downstream recipients, a proxy or gateway MUST remove or replace any received connection options before forwarding the message.ABNFExamples"],["ContentDisposition","A `Content-Disposition` header, (re)defined in RFC6266The Content-Disposition response header field is used to convey additional information about how to process the response payload, and also can be used to attach additional metadata, such as the filename to use when saving the response payload locally.ABNFExample"],["ContentEncoding","`Content-Encoding` header, defined in RFC7231The `Content-Encoding` header field indicates what content codings have been applied to the representation, beyond those inherent in the media type, and thus what decoding mechanisms have to be applied in order to obtain data in the media type referenced by the Content-Type header field.  Content-Encoding is primarily used to allow a representation's data to be compressed without losing the identity of its underlying media type.ABNFExample values`gzip` Examples"],["ContentLanguage","`Content-Language` header, defined in RFC7231The `Content-Language` header field describes the natural language(s) of the intended audience for the representation.  Note that this might not be equivalent to all the languages used within the representation.ABNFExample values`da` `mi, en` Examples"],["ContentLength","`Content-Length` header, defined in RFC7230When a message does not have a `Transfer-Encoding` header field, a Content-Length header field can provide the anticipated size, as a decimal number of octets, for a potential payload body.  For messages that do include a payload body, the Content-Length field-value provides the framing information necessary for determining where the body (and message) ends.  For messages that do not include a payload body, the Content-Length indicates the size of the selected representation.ABNFExample values`3495` Example"],["ContentRange","`Content-Range` header, defined in RFC7233"],["ContentType","`Content-Type` header, defined in RFC7231The `Content-Type` header field indicates the media type of the associated representation: either the representation enclosed in the message payload or the selected representation, as determined by the message semantics.  The indicated media type defines both the data format and how that data is intended to be processed by a recipient, within the scope of the received message semantics, after any content codings indicated by Content-Encoding are decoded.ABNFExample values`text/html; charset=ISO-8859-4` Examples"],["Cookie","`Cookie` header, defined in RFC6265If the user agent does attach a Cookie header field to an HTTP request, the user agent must send the cookie-string as the value of the header field.When the user agent generates an HTTP request, the user agent MUST NOT attach more than one Cookie header field.Example values`SID=31d4d96e407aad42` `SID=31d4d96e407aad42; lang=en-US` Example"],["Date","`Date` header, defined in RFC7231The `Date` header field represents the date and time at which the message was originated.ABNFExample values`Tue, 15 Nov 1994 08:12:31 GMT` Example"],["ETag","`ETag` header, defined in RFC7232The `ETag` header field in a response provides the current entity-tag for the selected representation, as determined at the conclusion of handling the request.  An entity-tag is an opaque validator for differentiating between multiple representations of the same resource, regardless of whether those multiple representations are due to resource state changes over time, content negotiation resulting in multiple representations being valid at the same time, or both.  An entity-tag consists of an opaque quoted string, possibly prefixed by a weakness indicator.ABNFExample values`\"xyzzy\"` `W/\"xyzzy\"` `\"\"` Examples"],["Expires","`Expires` header, defined in RFC7234The `Expires` header field gives the date/time after which the response is considered stale.The presence of an Expires field does not imply that the original resource will change or cease to exist at, before, or after that time.ABNFExample values`Thu, 01 Dec 1994 16:00:00 GMT` Example"],["From","`From` header, defined in RFC7231The `From` header field contains an Internet email address for a human user who controls the requesting user agent.  The address ought to be machine-usable.ABNFExample"],["Host","The `Host` header.HTTP/1.1 requires that all requests include a `Host` header, and so hyper client requests add one automatically.Currently is just a String, but it should probably become a better type, like url::Host or something.Examples"],["IfModifiedSince","`If-Modified-Since` header, defined in RFC7232The `If-Modified-Since` header field makes a GET or HEAD request method conditional on the selected representation's modification date being more recent than the date provided in the field-value. Transfer of the selected representation's data is avoided if that data has not changed.ABNFExample values`Sat, 29 Oct 1994 19:43:31 GMT` Example"],["IfUnmodifiedSince","`If-Unmodified-Since` header, defined in RFC7232The `If-Unmodified-Since` header field makes the request method conditional on the selected representation's last modification date being earlier than or equal to the date provided in the field-value. This field accomplishes the same purpose as If-Match for cases where the user agent does not have an entity-tag for the representation.ABNFExample values`Sat, 29 Oct 1994 19:43:31 GMT` Example"],["LastModified","`Last-Modified` header, defined in RFC7232The `Last-Modified` header field in a response provides a timestamp indicating the date and time at which the origin server believes the selected representation was last modified, as determined at the conclusion of handling the request.ABNFExample values`Sat, 29 Oct 1994 19:43:31 GMT` Example"],["Location","`Location` header, defined in RFC7231The `Location` header field is used in some responses to refer to a specific resource in relation to the response.  The type of relationship is defined by the combination of request method and status code semantics.ABNFExample values`/People.html#tim` `http://www.example.net/index.html` Examples"],["Protocol","Protocols that appear in the `Upgrade` header field"],["Referer","`Referer` header, defined in RFC7231The `Referer` [sic] header field allows the user agent to specify a URI reference for the resource from which the target URI was obtained (i.e., the \"referrer\", though the field name is misspelled).  A user agent MUST NOT include the fragment and userinfo components of the URI reference, if any, when generating the Referer field value.ABNFExample values`http://www.example.org/hypertext/Overview.html` Examples"],["Server","`Server` header, defined in RFC7231The `Server` header field contains information about the software used by the origin server to handle the request, which is often used by clients to help identify the scope of reported interoperability problems, to work around or tailor requests to avoid particular server limitations, and for analytics regarding server or operating system use.  An origin server MAY generate a Server field in its responses.ABNFExample values`CERN/3.0 libwww/2.17` Example"],["SetCookie","`Set-Cookie` header, defined RFC6265The Set-Cookie HTTP response header is used to send cookies from the server to the user agent.Informally, the Set-Cookie response header contains the header name \"Set-Cookie\" followed by a \":\" and a cookie.  Each cookie begins with a name-value-pair, followed by zero or more attribute-value pairs.ABNFExample values`SID=31d4d96e407aad42` `lang=en-US; Expires=Wed, 09 Jun 2021 10:18:14 GMT` `lang=; Expires=Sun, 06 Nov 1994 08:49:37 GMT` `lang=en-US; Path=/; Domain=example.com` Example"],["StrictTransportSecurity","`StrictTransportSecurity` header, defined in RFC6797This specification defines a mechanism enabling web sites to declare themselves accessible only via secure connections and/or for users to be able to direct their user agent(s) to interact with given sites only over secure connections.  This overall policy is referred to as HTTP Strict Transport Security (HSTS).  The policy is declared by web sites via the Strict-Transport-Security HTTP response header field and/or by other means, such as user agent configuration, for example.ABNFExample values`max-age=31536000` `max-age=15768000 ; includeSubDomains` Example"],["TransferEncoding","`Transfer-Encoding` header, defined in RFC7230The `Transfer-Encoding` header field lists the transfer coding names corresponding to the sequence of transfer codings that have been (or will be) applied to the payload body in order to form the message body.ABNFExample values`gzip, chunked` Example"],["Upgrade","`Upgrade` header, defined in RFC7230The `Upgrade` header field is intended to provide a simple mechanism for transitioning from HTTP/1.1 to some other protocol on the same connection.  A client MAY send a list of protocols in the Upgrade header field of a request to invite the server to switch to one or more of those protocols, in order of descending preference, before sending the final response.  A server MAY ignore a received Upgrade header field if it wishes to continue using the current protocol on that connection.  Upgrade cannot be used to insist on a protocol change.ABNFExample values`HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11` Examples"],["UserAgent","`User-Agent` header, defined in RFC7231The `User-Agent` header field contains information about the user agent originating the request, which is often used by servers to help identify the scope of reported interoperability problems, to work around or tailor responses to avoid particular user agent limitations, and for analytics regarding browser or operating system use.  A user agent SHOULD send a User-Agent field in each request unless specifically configured not to do so.ABNFExample values`CERN-LineMode/2.15 libwww/2.17b3` `Bunnies` NotesThe parser does not split the value Example"]],"trait":[["Scheme","An Authorization scheme to be used in the header."]]});