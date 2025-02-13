const fs = require("fs");
const path = require("path");
const {
    DOMAIN,
} = require("./constants");

// Paths
const PATHS = {
    IN: `${__dirname}/../src/symbolSet.json`,
};
const symbolSet = require(PATHS.IN);

// Not sure if this is right
function writeFile(_path, contents) {
    fs.mkdirSync(path.dirname(_path), { recursive: true });
    fs.writeFileSync(_path, contents);
}

async function make() {
    console.log("Creating SVG files...");

    for (let sf_name in symbolSet.symbols) {
        const selectedSymbol = symbolSet.symbols[sf_name]["regular"];
        const svg = `<svg viewBox="0 0 ${selectedSymbol.geometry.width} ${selectedSymbol.geometry.height}" xmlns="http://www.w3.org/2000/svg"><path d="${selectedSymbol.path}" /></svg>`;

        writeFile(`${__dirname}/../custom_components/${DOMAIN}/data/regular/${sf_name}.svg`, svg);
    }
    console.log("Done");
}

make();