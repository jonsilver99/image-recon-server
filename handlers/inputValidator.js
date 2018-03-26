'use strict';

let ilegalChars = new RegExp(/[|&;$%@"'=<>(){}+,]/g);
let maxLength = {
    Username: 30,
    Password: 30,
}

class InputValidator {

    static processinput(input) {
        let errors = {}

        for (let fieldName in input) {
            let validationStatus = this.isValid(fieldName, input[fieldName])
            if (validationStatus !== 'valid') {
                errors[fieldName] = validationStatus
            }
        }

        return (Object.keys(errors).length === 0 && errors.constructor === Object) ? 'all input is valid' : errors;
    }

    static isValid(fieldName, fieldValue) {
        let fieldErrors = [];
        if (this.hasNoValue(fieldValue)) {
            fieldErrors.push('No input given');
        }

        if (this.ilegalValue(fieldValue)) {
            fieldErrors.push('Input contains ilegal chars');
        }

        if (this.invalidLength(fieldValue, maxLength[fieldName])) {
            fieldErrors.push('input is too long ');
        }

        return (fieldErrors.length > 0) ? fieldErrors : 'valid';
    }


    static hasNoValue(input) {
        return (input == null || input == '') ? true : false;
    }

    static ilegalValue(input) {
        return (ilegalChars.test(input)) ? true : false;
    }

    static invalidLength(input, maxLengthAllowed) {
        return (input.length > maxLengthAllowed) ? true : false;
    }

    static sanitizeValue(input, replaceValue) {
        return input.replace(ilegal, replaceValue);
    }

    static validatePayload(files) {
        let payloadStatus = {
            isValid: null,
            message: null
        }
        let totalSize = 0;
        try {
            for (let i = 0; i < files.length; i++) {
                if (!files[i].mimetype.includes('image', 0)) {
                    throw 'Unsupported file type in payload. upload process aborted'
                }
                totalSize += files[i].data.byteLength;
            }
            if (totalSize / 1000000 >= 5) {
                throw "Max Payload size Exceeded. Try Uploading less files";
            }
            return payloadStatus.isValid = true;
        }
        catch (errMsg) {
            payloadStatus.isValid = false;
            payloadStatus.message = errMsg;
            return payloadStatus;
        }
    }
}

module.exports = InputValidator; 