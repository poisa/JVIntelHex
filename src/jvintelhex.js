/*
 Copyright 2013 Julian Fernando Vidal | https://github.com/poisa/JVIntelHex
 Version 1.0

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * Lightweight implementation of the Intel HEX format
 *
 * @param array   an array of bytes
 * @param int     byteCount Usually 16 or 32
 * @param byte    startAddress
 * @param bool    useRecordHeader Wether to prefix records with a colon ":" or not
 * @returns JVIntelHEX
 */
function JVIntelHEX(data, byteCount, startAddress, useRecordHeader)
{
    this.data = data;
    this.byteCount = byteCount;
    this.startAddress = startAddress;
    this.records = [];
    this.useRecordHeader = useRecordHeader;

    this.RECORD_TYPE_DATA = '00';
    this.RECORD_TYPE_EOF  = '01';
};

JVIntelHEX.prototype.createRecords = function()
{
    var data = this.data;
    var offset = 0;
    var currentAddress = this.startAddress;

    while (data.length > 0) {

        currentAddress = this.startAddress + offset;

        var rowByteCount = 0;
        var checksum     = 0;
        var recordData   = '';
        var record       = '';

        for (var i = 0; i < this.byteCount; i++) {
            var byte = data.shift();
            if (byte != undefined) {
                recordData += this.dec2hex(byte);
                checksum += byte;
                rowByteCount++;
            }
        }

        // Add MSB and LSB of address rather than entire address
        checksum += (currentAddress & 0xFF) + ((currentAddress & 0xFF00) >> 8);
        checksum += parseInt(this.RECORD_TYPE_DATA, 16);
        checksum += rowByteCount;

        if (this.useRecordHeader) {
            record += ':';
        }

        record += this.dec2hex(rowByteCount) +
                  this.dec2hex(currentAddress, 4) +
                  this.dec2hex(this.RECORD_TYPE_DATA) +
                  recordData +
                  this.dec2hex(this.calculateChecksum(checksum));

        record = record.toUpperCase();
        this.records.push(record);

        // Calculate next address
        offset += rowByteCount;
    }

    // Create EOF record
    record = '';
    if (this.useRecordHeader) {
        record += ':';
    }
    record += '00' +                 // byte count
              '0000' +               // address
              this.RECORD_TYPE_EOF + // record type
              'FF';                  // checksum

    this.records.push(record);

};

/**
 * Calculate the checksum for the passed data. The checksum is basically
 * the two's complement of just the 8 LSBs.
 *
 * @param int data
 * @returns int
 */
JVIntelHEX.prototype.calculateChecksum = function(data)
{
    checksum = data;
    checksum = checksum & 255; // grab 8 LSB
    checksum = ~checksum + 1;  // two's complement
    checksum = checksum & 255; // grab 8 LSB
    return checksum;
};

/**
 * Converts a decimal number to an hexadecimal string including leading 0s if required
 *
 * @param int d         Decimal number
 * @param int padding   Required padding (optional)
 * @returns string
 */
JVIntelHEX.prototype.dec2hex = function(d, padding)
{

    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
};

/**
 * Returns a formatted HEX string that can be saved to a HEX file.
 *
 * Eg:
 *  :10C00000576F77212044696420796F7520726561CC
 *  :10C010006C6C7920676F207468726F756768206137
 *  :10C020006C6C20746869732074726F75626C652023
 *  :10C03000746F207265616420746869732073747210
 *  :04C040007696E67397
 *  :00000001FF

 * @param string lineSeparator
 * @returns string
 */
JVIntelHEX.prototype.getHEXFile = function(lineSeparator)
{
    if (typeof lineSeparator === 'undefined') {
        lineSeparator = "\n";
    }

    returnValue = '';
    for (i = 0; i < this.records.length; i++) {
       returnValue += this.records[i] + lineSeparator;
    }
    return returnValue;
};

/**
 * Returns all the data in a big array of bytes.
 *
 * Eg:
 *    array(32, 1, 255, 34, 15, etc, etc);
 *
 * @returns array
 */
JVIntelHEX.prototype.getHEXAsByteArray = function()
{
    var data = this.getHEXFile('').replace(/:/g, '');
    var dataLength = data.length;

    byteArray = [];

    for (i = 0; i < dataLength; i += 2) {
        byte = data[i] + data[i + 1];
        byteArray.push(parseInt(byte, 16));
    }
    return byteArray;
};

/**
 * Returns all the data as a string of 1s and 0s
 *
 * Eg:
 *    10000111001000101010101111111010000, etc, etc
 *
 * @param bool prettyOutput Wheter to format the string with human readable spaces
 * @returns string
 */
JVIntelHEX.prototype.getHEXAsBinaryString = function(prettyOutput)
{
    if (typeof prettyOutput === 'undefined') {
        prettyOutput = false;
    }

    byteArray = this.getHEXAsByteArray();
    byteArrayLength = byteArray.length;
    binaryString = '';

    for (var currentByte = 0; currentByte < byteArrayLength; currentByte++)
    {
        for (var currentBit = 7; currentBit >= 0; currentBit--) {
            var bitMask = 1 << currentBit;
            if (byteArray[currentByte] & bitMask) {
                binaryString += '1';
            } else {
                binaryString += '0';
            }

            if (currentBit == 4 && prettyOutput) {
                binaryString += ' ';
            }

        }
        if (prettyOutput) {
            binaryString += '  ';
        }
    }

    return binaryString;
};
