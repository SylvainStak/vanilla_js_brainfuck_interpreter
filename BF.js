const fs = require('fs');

class BFInterpreter {
  constructor(codePath, inputPath, outputPath, dumpMemoryPath, cellBits=8, memorySize=30000) {
    this.code = this.readCode(codePath);
    this.input = inputPath?this.readInput(inputPath):'';
    this.outputPath = outputPath;
    this.dumpMemoryPath = dumpMemoryPath;
    this.flatCode = this.flattenCode();
    this.cellBits = cellBits;
    this.maxValue = Math.pow(2, cellBits)-1;
    this.memory = new Array(memorySize).fill(0);
    this.memorySize = memorySize;
    this.memoryPointer = 0;
    this.instructionsPointer = 0;
    this.instructionsCounter = 0;
    this.inputPointer = 0;
    this.dumpMemoryContent = '';
    this.output = '';
    this.status='';
    this.availableChars = '-+<>.,[]';
    this.memoryLineCells = {8: 12, 16: 8, 32: 4}
    this.syntaxCodes = {
      UCB: (line, char) => {
        return {
          status: 'Syntax Error',
          statusMessage: `Unexpected Closing Bracket at [line: ${line} | char: ${char}]`,
        }
      },
      UOB: (line, char) => {
        return {
          status: 'Syntax Error',
          statusMessage: `Unclosed Opening Bracket at [line: ${line} | char: ${char}]`,
        }
      },
      VALID: {
        status: 'Succesfull',
        statusMessage: 'Valid Code',
      }
    };
    this.operator = {
      // Increment Byte
      '+': () => {
        if(this.memory[this.memoryPointer] == this.maxValue) {
          this.memory[this.memoryPointer] = -1;
        }
        this.memory[this.memoryPointer]++;
      },
      // Decrement Byte
      '-': () => {
        if(this.memory[this.memoryPointer] == 0) {
          this.memory[this.memoryPointer] = this.maxValue+1;
        }
        this.memory[this.memoryPointer]--;
      },
      // Increment Memory Pointer
      '>': () => {
        if(this.memoryPointer == this.memorySize-1) {
          this.memoryPointer = -1;
        }
        this.memoryPointer++;
      },
      // Decrement Memory Pointer
      '<': () => {
        if(this.memoryPointer == 0) {
          this.memoryPointer = this.memorySize;
        }
        this.memoryPointer--;
      },
      // Read Input Byte
      ',': () => {
        if(this.input[this.inputPointer]) {
            this.memory[this.memoryPointer] = this.input[this.inputPointer].charCodeAt();
            this.inputPointer++;
        }
      },
      // Print ASCII Byte
      '.': () => {
        process.stdout.write(String.fromCharCode(this.memory[this.memoryPointer]));
        this.output += String.fromCharCode(this.memory[this.memoryPointer]);
      },
      // Loop forward
      '[': () => {
        if(!this.memory[this.memoryPointer]) {
          this.instructionsPointer = this.findRelativeBracket(this.instructionsPointer);
        }
      },
      // Loop Backwards
      ']': () => {
        if(this.memory[this.memoryPointer]) {
          this.instructionsPointer = this.findRelativeBracket(this.instructionsPointer);
        }
      },
    }
  }

  flattenCode = () => this.code.reduce((flattenedCode, line) => flattenedCode += line, '');

  // Check if brackets are balanced in the code
  validateSyntax() {
    let openingBrackets = 0;
    let closingBrackets = 0;
    let markedLine = -1;
    let markedChar = -1;

    for (let line = 0; line < this.code.length; line++) {
      for (let char = 0; char < this.code[line].length; char++) {
        if (this.code[line][char] == '[') {
          if (openingBrackets == closingBrackets) {
            markedLine = line + 1;
            markedChar = char + 1;
          }
          openingBrackets++;
        }

        if (this.code[line][char] == ']') {
          if (openingBrackets == closingBrackets) return this.syntaxCodes.UCB(++line, ++char);
          closingBrackets++;
        }
      }
    }

    if (openingBrackets > closingBrackets) return this.syntaxCodes.UOB(markedLine, markedChar);
    else return this.syntaxCodes.VALID;
  }

  findRelativeBracket(index) {
    let counter = 1; // if counter is over 0, relative bracket has not been found yet

    if(this.flatCode[index] == '[') { // Find relative closing bracket
      for (let i = ++index; i < this.flatCode.length; i++) {
        if(this.flatCode[i] == '[') counter++;
        if(this.flatCode[i] == ']') counter--;

        if(!counter) return i;
      }
    } else if(this.flatCode[index] == ']') { // Find relative opening bracket
      for (let i = --index; i > 0; i--) {
        if(this.flatCode[i] == ']') counter++;
        if(this.flatCode[i] == '[') counter--;

        if(!counter) return i;
      }
    }

    throw new Error('Tried to find a relative bracket for a no-bracket char');
  }

  addLeadingZeroes(num, size) {
    var s = '0'.repeat(size) + num;
    return s.substr(s.length-size);
  }

  writeOutput() {
    fs.writeFile(this.outputPath, this.output, error => {
      if (error) return console.log(`Could not write the output on the following path --> ${this.outputPath}`);
    });
  }

  fillMemoryOutput() {
    let lineSize = this.memoryLineCells[this.cellBits]; // Length of each line

    for (let i = 0; i < this.memorySize; i+=lineSize) {
      let line = '';
      line += this.addLeadingZeroes(i, this.memorySize.toString().length);
      line += ': ';

      for (let j = i; j < i+lineSize; j++) { // Cell values
        if(!this.memory[j] && this.memory[j] !== 0) line += ' '.repeat(this.maxValue.toString().length);
        else line += this.addLeadingZeroes(this.memory[j] || 0, this.maxValue.toString().length);
        line += ' ';
      }

      for (let j = i; j < i+lineSize; j++) { // Decimal to Ascii values
        if(this.memory[j] && this.memory[j] > 31) line += String.fromCharCode(this.memory[j]);
        else if(!this.memory[j] && this.memory[j] !== 0) line += ' ';
        else line += '.';
      }

      this.dumpMemoryContent += `${line}\n`;
    }
  }

  dumpMemoryToFile() {
    fs.writeFile(this.dumpMemoryPath, this.dumpMemoryContent, error => {
      if (error) return console.log(`Could not write the memory state on the following path --> ${this.dumpMemoryPath}`);
    });
  }

  runCode() {
    let codeSyntax = this.validateSyntax();
    if(codeSyntax.status == 'Succesfull') {
      let startTime = Date.now();
      while(this.instructionsPointer < this.flatCode.length) {
        if(this.availableChars.includes(this.flatCode[this.instructionsPointer])) {
          this.operator[this.flatCode[this.instructionsPointer]]();
          this.instructionsCounter++;
        }
        this.instructionsPointer++;
      }
      let endTime = Date.now();
      console.log(`\n(Executed ${this.instructionsCounter} instructions in ${endTime-startTime} ms)`);
      if(this.outputPath) this.writeOutput();
      if(this.dumpMemoryPath) {
        this.fillMemoryOutput();
        this.dumpMemoryToFile();
      }
    } else {
      console.log(codeSyntax);
    }
  }

  readCode(codePath) {
    let extractedData = [];
    try {
      const data = fs.readFileSync(codePath, 'utf8');
      extractedData = data.split('\r\n');
    } catch (err) {
      console.log(`Could not read the following file: "${codePath}"`);
    }
    return extractedData;
  }

  readInput(inputPath) {
    let input = '';
    try {
      const data = fs.readFileSync(inputPath, 'utf8');
      input = data;
    } catch (err) {
      console.log(`Could not read the following file: "${inputPath}"`);
    }
    return input;
  }
}

const args = process.argv.slice(2);
const argsRegExp = new RegExp(/^\w+=(\D|\d)+$/);
let bits = 8;
let tapeSize = 30000;
let codePath = '';
let inputPath = '';
let outputPath = '';
let dumpMemoryPath = '';
let invalidArgs = [];

// Assign arguments value
args.forEach(arg => {
  if(argsRegExp.test(arg)) { // Valid argument
    let argName = arg.split('=')[0];
    let argValue = arg.split('=')[1];
    switch(argName) {
      case 'code': codePath=argValue; break;
      case 'input': inputPath=argValue; break;
      case 'output': outputPath=argValue; break;
      case 'dumpMemory': dumpMemoryPath=argValue; break;
      case 'tape':
        let tapeValue = parseInt(argValue);
        if(isNaN(tapeValue)) invalidArgs.push(arg);
        else tapeSize=tapeValue;
        break;
      case 'bits':
        let bitsValue = parseInt(argValue);
        if(bitsValue==8 || bitsValue==16 || bitsValue==32) bits=bitsValue;
        else invalidArgs.push(arg);
        break;
      default: invalidArgs.push(arg);
    }
  } else { // Invalid argument
    invalidArgs.push(arg);
  }
});

// Do not run the code if there are invalid arguments
if(invalidArgs.length > 0) {
  console.log('======================================');
  console.log('the following arguments are not valid:');
  invalidArgs.forEach(arg => console.log(
    `* ${arg}${arg.startsWith('bits') ? ' --> (only 8, 16 and 32 bits available)' : ''}`
  ));
  console.log('======================================');
} else if (!codePath) {
  console.log('=================================================================');
  console.log('You need to pass the code path as an argument in order to run it:');
  console.log('example --> node BF.js code=./codefolder/helloworld.b');
  console.log('=================================================================');
} else {
  const Interpreter = new BFInterpreter(codePath, inputPath, outputPath, dumpMemoryPath, bits, tapeSize);
  Interpreter.runCode();
}
