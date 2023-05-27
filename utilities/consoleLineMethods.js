import readline from "readline";

export const resetLine = () => {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
}

export const writeLine = (str) => {
    process.stdout.write(str);
}

export const replaceLine = (str) => {
    resetLine();
    process.stdout.write(str);
}