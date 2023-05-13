const resetLine = () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
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