#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const figlet_1 = __importDefault(require("figlet"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const enquirer_1 = require("enquirer");
const outputFile = path_1.default.join(__dirname, '..', 'files', 'output.json');
const inputFile = path_1.default.join(__dirname, '..', 'files', "iwarranty.csv");
let output = [];
function correctData(datas) {
    datas.map((data) => {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = transformValue(data[key]);
            }
            removeWhiteSpaceFromNumbers(data);
        }
        output.push(data);
    });
    fs_1.default.writeFileSync(outputFile, JSON.stringify(output, null, 2));
}
function transformValue(value) {
    if (typeof value === "string" && value.includes(";")) {
        if (value.includes("|")) {
            return value.split(";").map(item => {
                const [childKey, childValue] = item.split("|");
                return { [childKey]: childValue };
            });
        }
        else {
            return value.split(";");
        }
    }
    else {
        return value;
    }
}
function removeWhiteSpaceFromNumbers(data) {
    if (data.directory_contact__phone && data.directory_contact__phone.trim() !== "") {
        data.directory_contact__phone = data.directory_contact__phone.replace(/\s/g, "");
    }
    if (data.directory_contact__mobile && data.directory_contact__mobile.trim() !== "") {
        data.directory_contact__mobile = data.directory_contact__mobile.replace(/\s/g, "");
    }
    return data;
}
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    let results = [];
    fs_1.default.createReadStream(inputFile)
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => results.push(data))
        .on('end', () => {
        correctData(results);
    });
});
function checkKey(key) {
    let numKey = Number(key);
    if (numKey / 1 === numKey)
        return numKey + 1;
    else
        return key;
}
function displayKeyValuePairs(obj, indent = 0) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === "object" && value !== null) {
                // If the value is an object, recursively call the function with increased indentation
                console.log(`${" ".repeat(indent)}${checkKey(key)}:`);
                displayKeyValuePairs(value, indent + 2);
            }
            else {
                // If the value is not an object, display the key-value pair with appropriate indentation
                console.log(`${" ".repeat(indent)}${checkKey(key)}: ${value}`);
            }
        }
    }
}
function search(title) {
    const entry = [];
    const data = JSON.parse(fs_1.default.readFileSync(outputFile, 'utf8'));
    data.filter((item) => {
        if (item.content_post_title.toLowerCase().includes(title.toLowerCase()))
            entry.push(item);
    });
    if (entry) {
        console.log(`${entry.length} Search found for ${title}\n`);
        const result = displayKeyValuePairs(entry);
    }
    else {
        console.log(`Entry with title "${title}" not found.`);
    }
}
//main();
// Declare a variable to store the user's name 
let userName;
const exit = () => {
    (0, figlet_1.default)("Good Bye", (err, data) => {
        console.log(gradient_string_1.default.pastel.multiline(data));
    });
    process.exit(0);
};
const greet = () => __awaiter(void 0, void 0, void 0, function* () {
    // Displaying Geeks CLI 
    (0, figlet_1.default)('Welcome To Iwarranty', function (err, data) {
        console.log(gradient_string_1.default.pastel.multiline(data));
    });
    // Wait for 2secs 
    yield new Promise(resolve => setTimeout(resolve, 1000));
    const response = yield (0, enquirer_1.prompt)({
        type: 'input',
        name: 'name',
        message: 'Enter parse to process the excel sheet : ',
    });
    if (response.name.toLowerCase() === 'parse') {
        yield main();
        console.log("\nCorrected Data is printed at output.json\n\n");
        while (true) {
            // Ask the user's name 
            const response = yield (0, enquirer_1.prompt)({
                type: 'input',
                name: 'name',
                message: 'Enter the retailer name to display details or type exit to exit? : ',
            });
            if (response.name.toLowerCase() !== "exit") {
                // Set the user's name 
                search(response.name);
            }
            else if (response.name.toLowerCase() === "exit") {
                exit();
            }
        }
    }
    else if (response.name.toLowerCase() === 'exit')
        exit();
    else {
        console.log(`Unknown command: ${name}`);
    }
});
//Call the askName function 
greet();
