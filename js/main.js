const DOMAIN = "sf_symbols_svg";

const ICON_STORE = {};

const preProcessIcon = async (iconSet, iconName) => {
    let icon = iconName;
    const data = await fetch(`/${DOMAIN}/icons/${iconSet}/${icon}.svg`);
    const text = await data.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    if (!doc || !doc.querySelector("svg")) {
        console.log("SF Symbols SVG: invalid icon");
        return {};
    }

    const viewBox = doc.querySelector("svg").getAttribute("viewBox");
    const _paths = doc.querySelectorAll("path");
    const paths = {};
    let path = undefined;
    let sumpath = "";
    for (const pth of _paths) {
        sumpath = sumpath + pth.getAttribute("d");
    }
    path = path ?? sumpath;
    
/* Javascript security context
    // Don't allow full code to be used if the svg may contain javascript
    let innerSVG = doc.querySelector("svg");
    // Don't allow full code if any attribute is onClick or something
    if (Array.from(innerSVG?.attributes).some((a) => a.name.startsWith("on")))
      innerSVG = undefined;
    // Don't allow full code if it contains <script> tags
    if (innerSVG?.getElementsByTagName("script").length) innerSVG = undefined;
*/

    return { viewBox, path };
};

const getIcon = (iconSet, iconName) => {
    return new Promise(async (resolve, reject) => {
        const icon = `${iconSet}:${iconName}`;
        if (ICON_STORE[icon]) resolve(ICON_STORE[icon]);
  
        ICON_STORE[icon] = preProcessIcon(iconSet, iconName);
  
        resolve(ICON_STORE[icon]);
    });
};

const getIconList = async (iconSet) => {
    const data = await fetch(`/${DOMAIN}/list/${iconSet}`);
    const text = await data.text();
    return JSON.parse(text);
};

// custom icons
if (!("customIconsets" in window)) {
    window.customIconsets = {};
}
if (!("customIcons" in window)) {
    window.customIcons = {};
}

window.customIcons["sf"] = {
    getIcon: (iconName) => getIcon("regular", iconName),
    getIconList: () => getIconList("regular"),
};