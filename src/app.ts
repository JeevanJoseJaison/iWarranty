#!/usr/bin/env node

import  figlet from "figlet";
import gradient from "gradient-string";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { prompt } from "enquirer";

const outputFile = path.join(__dirname, '..', 'files' , 'output.json');
const inputFile = path.join(__dirname, '..', 'files', "iwarranty.csv");
let output: any[] = [];


function correctData(datas: any[]) {
  datas.map((data) => {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        data[key] = transformValue(data[key]);
      }
      removeWhiteSpaceFromNumbers(data);
    }
    output.push(data);
  });
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
}
function transformValue(value: any): any {
    if (typeof value === "string" && value.includes(";")) {
      if (value.includes("|")) {
        return value.split(";").map(item => {
          const [childKey, childValue] = item.split("|");
          return { [childKey]: childValue };
        });
      } else {
        return value.split(";");
      }
    } else {
      return value;
    }
  }
  

function removeWhiteSpaceFromNumbers(data: any) {
  if (data.directory_contact__phone && data.directory_contact__phone.trim() !== "") {
    data.directory_contact__phone = data.directory_contact__phone.replace(/\s/g, "");
  }

  if (data.directory_contact__mobile && data.directory_contact__mobile.trim() !== "") {
    data.directory_contact__mobile = data.directory_contact__mobile.replace(/\s/g, "");
  }

  return data;
}

const main = async () => {
  let results: any[] = [];
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (data : any) => results.push(data))
    .on('end', () => {
      correctData(results);

    });
}

function checkKey(key: any) {
  let numKey = Number(key);
  if (numKey / 1 === numKey)
    return numKey + 1
  else
    return key
}

function displayKeyValuePairs(obj: any, indent: number = 0) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === "object" && value !== null) {
        // If the value is an object, recursively call the function with increased indentation
        console.log(`${" ".repeat(indent)}${checkKey(key)}:`);
        displayKeyValuePairs(value, indent + 2);
      } else {
        // If the value is not an object, display the key-value pair with appropriate indentation
        console.log(`${" ".repeat(indent)}${checkKey(key)}: ${value}`);
      }
    }
  }
}

function search(title: string) {
  const entry: any[] = [];
  const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
  data.filter((item: any) => {
    if (item.content_post_title.toLowerCase().includes(title.toLowerCase()))
      entry.push(item)
  });

  if (entry) {
    console.log(`${entry.length} Search found for ${title}\n`)
    const result = displayKeyValuePairs(entry);
  } else {
    console.log(`Entry with title "${title}" not found.`);
  }
}
//main();
// Declare a variable to store the user's name 
let userName: string;

const exit = () => {
  figlet("Good Bye", (err, data) => {
    console.log(gradient.pastel.multiline(data));
  });
  process.exit(0);
}

const greet = async () => {
  interface PromptInput {
    type: 'input';
    name: string;
  }

  // Displaying Geeks CLI 
  figlet('Welcome To Iwarranty', function (err, data) {
    console.log(gradient.pastel.multiline(data));
  });

  // Wait for 2secs 
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await prompt<Partial<PromptInput>>({
    type: 'input',
    name: 'name',
    message: 'Enter parse to process the excel sheet : ',
  });


  if (response.name.toLowerCase() === 'parse') {
    await main();
    console.log("\nCorrected Data is printed at output.json\n\n")
    while (true) {
      // Ask the user's name 
      const response = await prompt<Partial<PromptInput>>({
        type: 'input',
        name: 'name',
        message: 'Enter the retailer name to display details or type exit to exit? : ',
      });
      if (response.name.toLowerCase() !== "exit") {
        // Set the user's name 
        search(response.name)
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
}

//Call the askName function 
greet();
