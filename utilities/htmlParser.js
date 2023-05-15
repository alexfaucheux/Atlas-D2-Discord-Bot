const HTMLParser = require('html-to-json-parser');
const { bold, underscore } = require('discord.js');

module.exports = {
    parseHtml
};

async function parseHtml(htmlContent) {
    // Creates an object out of the html
    if (!htmlContent.includes('<html>')) {
        htmlContent = `<html>${htmlContent}</html>`;
    }
    let result = await HTMLParser.default(htmlContent, false);
    return generateStr({ parent: null, content: result.content, index: 0 }, '', 0);
}

// Generates a string using the HTML object.
// TODO: Add support for <a>, <li>, and <p> tags
function generateStr(contentObj, str, listLevel) {
    let contentItem;
    let contentIndex;
    let contentParent;
    try {
        contentIndex = contentObj.index;
        contentItem = contentObj.content[contentIndex];
        contentParent = contentObj.parent;
        if (!contentItem) {
            throw new Error('Content Item Not Defined');
        }
    } catch (e) {
        // Enters here when index out of bounds or undefined content
        // No parent or null index, return completed string
        if (!contentObj || !contentParent) {
            return str;
        }

        listLevel = listLevel ? listLevel - 1 : 0;

        // Continue traversing parent
        contentParent.index++;
        return generateStr(contentParent, str, listLevel);
    }

    switch (contentItem.type) {
        case 'h1':
        case 'h2':
            contentObj.index++;
            str += '\n' + underscore(bold(contentItem.content[0])) + '\n\n';
            return generateStr(contentObj, str, listLevel);

        case 'h3':
        case 'h4':
            contentObj.index++;
            str += bold(contentItem.content[0]) + '\n\n';
            return generateStr(contentObj, str, listLevel);

        case 'ul':
            listLevel++;
            if (contentParent?.content[contentParent.index]?.type == 'ul') {
                str = str.trim() + '\n';
            }
            break;

        case 'li':
            str += '-'.repeat(listLevel) + ' ';
            break;
    }

    if (contentItem.content) {
        return generateStr(
            { parent: contentObj, content: contentItem.content, index: 0 },
            str,
            listLevel
        );
    }

    // No content == bottom of tree == body text
    str += contentItem;
    const parentIndex = contentParent?.index;
    const parentItem = contentParent?.content[parentIndex];

    // Add extra spacing if a list element
    if (parentItem?.type == 'li') {
        str += '\n\n';
    }

    // contentItem has no content, return to and traverse parent
    contentParent.index++;
    return generateStr(contentParent, str, listLevel);
}
