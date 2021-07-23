# Vanilla JS BrainFuck Interpreter

<p align="center">
    <a href="https://sylvainstak.github.io/about" alt="Maintenance">
        <img src="https://img.shields.io/badge/maintainer-SylvainStak-yellow.svg" />
    </a>
    <a href="https://nodejs.org" alt="Requirement">
        <img src="https://img.shields.io/badge/requirement-NodeJS-green.svg" />
    </a>
</p>

# Important
You only need the file BF.js to start working with this interpreter, but you can clone this repository which contains the test-code folder with some useful code examples.

# Notes

This project is based on vanilla javascript, this means that no dependencies are required in order to make it work, just nodejs installed in your machine so you can run javascript code.

Remember that this is an interpreter and NOT a compiler, therefore the brainfuck code will not be translated to any other language or machine code before running.

The memory works as a wrapper, that means if you exceed the max value of a memory cell, the value will become 0, and viceversa. The same applies to the memory pointer so ideally you won't encounter memory overflow issues, nonetheless this can be changed in a future update so you will be able to choose between a (wrap) or (overflow) mode.

It is recommended to use the default tape size of 30000, although you will be able to adapt it in order to meet your requirements, which is also very useful if you think about debugging this code using the (dumpMemory) parameter.

# Parameters

```
code --> Path to the file containing the Brainfuck code
input --> Path to the file containing the input
output --> Path where you want print the output
dumpMemory --> Path where you want to print the memory state after code execution
tape --> Speficy the tape (memory) length, it is set to 30000 by default
bits --> Speficy the bits to work with, this will affect the max value that can be stored on each memory cell, it is set to 8 by default
```

# Examples

## Run code without input
```
node BF.js code=./test-code/HelloWorld.b
```
![App gallery 1](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/run-code-without-input.PNG "run code without input")

## Run code with input
```
node BF.js code=./test-code/numWarp.b input=./test-code/input.txt
```
![App gallery 2](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/run-code-with-input.PNG "run code with input")

## Print the output on a file
```
node BF.js code=./test-code/sierpinski-triangle.b output=./test-code/sierpinski-result.txt
```
![App gallery 3](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/print-output-1.PNG "print output 1")
![App gallery 4](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/print-output-2.PNG "print output 2")

## Dump memory state into a file after the code runs
```
node BF.js code=./test-code/HelloWorld.b dumpMemory=./test-code/memoryState.txt
```
![App gallery 5](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/dump-memory-1.PNG "dump memory 1")
![App gallery 6](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/dump-memory-2.PNG "dump memory 2")

## Set the size of the tape (memory space) [default: 30000]
```
node BF.js code=./test-code/HelloWorld.b tape=100
```
![App gallery 7](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/tape.PNG "tape")

## Set the bits to define the max value of each memory cell (8 bits --> 255 | 16 bits --> 65535 | 32 bits --> 4294967295) [default: 8]
```
node BF.js code=./test-code/HelloWorld.b bits=32
```
![App gallery 8](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/working-bits.PNG "working-bits")
![App gallery 9](https://github.com/SylvainStak/vanilla_js_brainfuck_interpreter/blob/master/readme-images/non-working-bits.PNG "non-working-bits")
