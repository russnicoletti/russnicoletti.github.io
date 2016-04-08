initSidebarItems({"enum":[["Compression","When compressing data, the compression level can be specified by a value in this enum."],["Flush","Values which indicate the form of flushing to be used when compressing or decompressing in-memory data."],["Status","Possible status results of compressing some data or successfully decompressing a block of data."]],"mod":[["read","Types which operate over `Reader` streams, both encoders and decoders for various formats."],["write","Types which operate over `Writer` streams, both encoders and decoders for various formats."]],"struct":[["Compress","Raw in-memory compression stream for blocks of data.This type is the building block for the I/O streams in the rest of this crate. It requires more management than the `Read`/`Write` API but is maximally flexible in terms of accepting input from any source and being able to produce output to any memory location.It is recommended to use the I/O stream adaptors over this type as they're easier to use."],["DataError","Error returned when a decompression object finds that the input stream of bytes was not a valid input stream of bytes."],["Decompress","Raw in-memory decompression stream for blocks of data.This type is the building block for the I/O streams in the rest of this crate. It requires more management than the `Read`/`Write` API but is maximally flexible in terms of accepting input from any source and being able to produce output to any memory location.It is recommended to use the I/O stream adaptors over this type as they're easier to use."],["GzBuilder","A builder structure to create a new gzip Encoder.This structure controls header configuration options such as the filename."],["GzHeader","A structure representing the header of a gzip stream.The header can contain metadata about the file that was compressed, if present."]],"trait":[["FlateReadExt","A helper trait to create encoder/decoders with method syntax."],["FlateWriteExt","A helper trait to create encoder/decoders with method syntax."]]});