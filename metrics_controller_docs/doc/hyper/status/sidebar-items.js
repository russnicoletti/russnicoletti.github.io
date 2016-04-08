initSidebarItems({"enum":[["StatusClass","The class of an HTTP `status-code`.RFC 7231, section 6 (Response Status Codes):The first digit of the status-code defines the class of response. The last two digits do not have any categorization role.And:HTTP status codes are extensible.  HTTP clients are not required to understand the meaning of all registered status codes, though such understanding is obviously desirable.  However, a client MUST understand the class of any status code, as indicated by the first digit, and treat an unrecognized status code as being equivalent to the x00 status code of that class, with the exception that a recipient MUST NOT cache a response with an unrecognized status code.For example, if an unrecognized status code of 471 is received by a client, the client can assume that there was something wrong with its request and treat the response as if it had received a 400 (Bad Request) status code.  The response message will usually contain a representation that explains the status.This can be used in cases where a status code’s meaning is unknown, also, to get the appropriate *category* of status."],["StatusCode","An HTTP status code (`status-code` in RFC 7230 et al.).This enum contains all common status codes and an Unregistered extension variant. It allows status codes in the range [0, 65535], as any `u16` integer may be used as a status code for XHR requests. It is recommended to only use values between [100, 599], since only these are defined as valid status codes with a status class by HTTP.If you encounter a status code that you do not know how to deal with, you should treat it as the `x00` status code—e.g. for code 123, treat it as 100 (Continue). This can be achieved with `self.class().default_code()`:IANA maintain the Hypertext Transfer Protocol (HTTP) Status Code Registry which is the source for this enum (with one exception, 418 I'm a teapot, which is inexplicably not in the register)."]]});