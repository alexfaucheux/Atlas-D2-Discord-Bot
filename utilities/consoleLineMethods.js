const readline = require('readline');

const resetLine = () => {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
}

const writeLine = (str) => {
    process.stdout.write(str);
}

const replaceLine = (str) => {
    resetLine();
    process.stdout.write(str);
}

module.exports = {
    resetLine,
    writeLine,
    replaceLine
}