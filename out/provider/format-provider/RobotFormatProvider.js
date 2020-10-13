'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var Type;
(function (Type) {
    Type[Type["Resource"] = 0] = "Resource";
    Type[Type["Body"] = 1] = "Body";
    Type[Type["Name"] = 2] = "Name";
    Type[Type["getLengthGuide"] = 3] = "getLengthGuide";
    Type[Type["Keyword"] = 4] = "Keyword";
    Type[Type["Undefined"] = 5] = "Undefined";
    Type[Type["Empty"] = 6] = "Empty";
    Type[Type["For"] = 7] = "For";
    Type[Type["Comment"] = 8] = "Comment";
})(Type || (Type = {}));
function multiplyString(base, times) {
    let result = '';
    // for (let i = 0; i < times; i++) {
    //     result += base;
    // }
    result += base;
    return result;
}
function getEmptyArrayOfString(length) {
    let str = new Array(length);
    for (let i = 0; i < length; i++) {
        str[i] = "";
    }
    return str;
}
function documentEditor(ranges, newStr) {
    let editor = [];
    for (let i = 0; i < newStr.length; i++) {
        editor.push(new vscode_1.TextEdit(ranges[i], newStr[i]));
    }
    return editor;
}
class RobotFormatProvider {
    provideDocumentFormattingEdits(document, options, token) {
        let ranges = RobotFormatProvider.getAllLineRange(document);
        let formatted = RobotFormatProvider.groupFormat(document);
        return documentEditor(ranges, formatted);
    }
    static getAllLineRange(document) {
        let ranges = [];
        for (let i = 0; i < document.lineCount; i++) {
            let range = document.lineAt(i).range;
            ranges.push(range);
        }
        return ranges;
    }
    //Group format
    static groupFormat(document) {
        const lines = new Array(document.lineCount + 1);
        for (let i = 0; i < document.lineCount; i++) {
            lines[i] = document.lineAt(i).text;
        }
        lines[lines.length - 1] = '';
        let lastType = Type.Undefined;
        let bucket = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].replace(/\s+$/, '');
            const type = RobotFormatProvider.getLineType(line);
            if (type == Type.Name || type == Type.Empty || type == Type.For) {
                if (bucket.length > 0) {
                    const columns = RobotFormatProvider.identifyBucketColumns(bucket, lines);
                    RobotFormatProvider.formatBucket(bucket, columns, lines);
                }
                lines[i] = line.split(/\s{2,}/).join('  ');
                bucket = [];
            }
            else if (type == Type.Comment) {
                lines[i] = line;
            }
            else {
                bucket.push(i);
            }
            if (type != Type.Comment) {
                lastType = type;
            }
        }
        lines.splice(lines.length - 1);
        return lines;
    }
    static identifyBucketColumns(bucket, lines) {
        let columns = [];
        for (var index of bucket) {
            let line = lines[index];
            let arr = line.split(/\s{2,}/);
            for (let i = columns.length; i < arr.length; i++) {
                columns.push(0);
            }
            for (let i = 0; i < arr.length; i++) {
                columns[i] = columns[i] < arr[i].length
                    ? arr[i].length
                    : columns[i];
            }
        }
        return columns;
    }
    static formatBucket(bucket, columns, lines) {
        for (let index of bucket) {
            lines[index] = RobotFormatProvider.formatLine(lines[index], columns);
        }
    }
    static formatLine(line, columns) {
        let arr = line.split(/\s{2,}/);
        return arr.join('  ');
    }
    static getLineType(line) {
        let l = line.replace(/\s+$/, "");
        if (/^\S+/.test(l)) {
            if (l.replace(/^\\\s+/, "\\ ").split(/\s{2,}/).length > 1) {
                return Type.Resource;
            }
            else {
                return Type.Name;
            }
        }
        if (l.length == 0) {
            return Type.Empty;
        }
        if (/^\s*#/.test(l)) {
            return Type.Comment;
        }
        if (/^\s*:/.test(l)) {
            return Type.For;
        }
        // if (/^\s+\[.*?\]/.test(l)) {     return Type.Keyword; }
        return Type.Body;
    }
    // End group format
    // Begin All file format
    static getFormattedLines(document) {
        let formatted = getEmptyArrayOfString(document.lineCount);
        let formatCode = [];
        let temp = [];
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;
            temp.push(line.replace(/\s+$/, ""));
            if (/^\S+/.test(line)) {
                if (line.replace(/\s+$/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/).length > 1) {
                    formatCode.push(0);
                }
                else {
                    formatCode.push(2);
                }
            }
            else if (/^\s*$/.test(line)) {
                formatCode.push(4);
            }
            else if (/^\s*#/.test(line)) {
                formatCode.push(2);
            }
            else if (/^\s*:/.test(line)) {
                formatCode.push(3);
            }
            else {
                formatCode.push(1);
            }
        }
        let lengthGuide = RobotFormatProvider.getLengthGuide(temp, formatCode);
        for (let i = 0; i < temp.length; i++) {
            let line = temp[i];
            if (formatCode[i] == 0 || formatCode[i] == 1) {
                let sentences;
                let guide = formatCode[i];
                if (formatCode[i] == 1) {
                    formatted[i] = "    ";
                    sentences = line.replace(/^\s+/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/);
                }
                else {
                    sentences = line.split(/\s{2,}/);
                }
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j].replace(/\\\s/, "\\    ");
                    while (sentence.length < lengthGuide[guide][j] && j < sentences.length - 1) {
                        sentence = sentence + " ";
                    }
                    formatted[i] = formatted[i] + sentence;
                }
            }
            else if (formatCode[i] == 2) {
                formatted[i] = line;
            }
            else if (formatCode[i] == 3) {
                let sentences = line.replace(/^\s+/, "").split(/\s{2,}/);
                formatted[i] = "    ";
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j];
                    formatted[i] = formatted[i] + sentence;
                    if (j < sentences.length - 1) {
                        formatted[i] = formatted[i] + "  ";
                    }
                }
            }
        }
        return formatted;
    }
    static getLengthGuide(lines, formatCode) {
        let guides = [];
        guides.push([]);
        guides.push([]);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (formatCode[i] == 0 || formatCode[i] == 1) {
                let sentences;
                let code = formatCode[i];
                if (code == 1) {
                    sentences = line.replace(/^\s+/, "").replace(/^\\\s+/, "\\ ").split(/\s{2,}/);
                }
                else {
                    sentences = line.split(/\s{2,}/);
                }
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j].replace(/^\\\s/, "\\    ");
                    if (j == sentences.length - 1 && /^#/.test(sentence)) {
                        break;
                    }
                    if (guides[code].length == j) {
                        guides[code].push(sentence.length + 4);
                    }
                    else if (guides[code][j] < sentence.length + 4) {
                        guides[code][j] = sentence.length + 4;
                    }
                }
            }
        }
        return guides;
    }
}
exports.RobotFormatProvider = RobotFormatProvider;
//# sourceMappingURL=RobotFormatProvider.js.map