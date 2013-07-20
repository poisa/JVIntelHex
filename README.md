# JVIntelHEX
### A javascript Intel HEX format writer (lightweight implementation)

Version 1.0 Created by [Julian Vidal](http://julianvidal.com/)

## What does it do?

Takes some arbitrary data and wraps it in the Intel [HEX protocol](http://en.wikipedia.org/wiki/Intel_HEX). Note that this is not a full implementation and all the record types are not defined. It is up to you to fork this and implement them if you ever need them.

## Installation

You only need to copy `jvintelhex.js` to your project.

## Usage

```javascript
// The data needs to be an array of bytes, so values over 255 won't work in this implementation.
data = new Array(4, 5);

// How many bytes per HEX record. Usually 16 or 32 but can take arbitrary numbers.
byteCount = 16;

// Your record's start address (you might not even need this so 0 is a good option if you don't know what this is)
startAddress = 0;

// Wether to prepend all records with ':' like in the official Intel HEX specs. 
useRecordHeader = true;

intelHEX = new JVIntelHEX(data, byteCount, startAddress, useRecordHeader);

// Crunch the data
intelHEX.createRecords();

console.debug('HEX file', intelHEX.getHEXFile());
console.debug('HEX as byte array', intelHEX.getHEXAsByteArray());
console.debug('HEX as binary string', intelHEX.getHEXAsBinaryString());
```

## Examples

You will find a fully working example in the `examples` directory.

## License

JVIntelHEX is released under the Apache 2.0 license. See the included LICENSE file.

## VERSION HISTORY

2013-07-19 First version
