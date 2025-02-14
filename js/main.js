const DOMAIN = "sf_symbols_svg";
const ICON_STORE = {};
const PATH_CLASSES = {
    base: "base",
    badge: "badge",
  };

const preProcessIcon = async (iconSet, iconName) => {
    let [icon, format] = iconName.split("#");
    const data = await fetch(`/${DOMAIN}/icons/${iconSet}/${icon}.svg`);
    const text = await data.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    if (!doc || !doc.querySelector("svg")) {
        console.log(`SF Symbols SVG: Invalid icon '${icon}'`);
        return {};
    }

    const viewBox = doc.querySelector("svg").getAttribute("viewBox");
    const _paths = doc.querySelectorAll("path");
    const paths = {};

    let path = undefined;
    let badgePath = undefined;
    let sumpath = "";

    for (const pth of _paths) {
        sumpath = sumpath + pth.getAttribute("d");

        const cls = pth.classList[0];
        if (PATH_CLASSES[cls] == "base") path = pth.getAttribute("d");
        if (PATH_CLASSES[cls] == "badge") badgePath = pth.getAttribute("d");
    }
    path = path ?? sumpath;
    
/* Javascript security context */
    // Don't allow full code to be used if the svg may contain javascript
    let innerSVG = doc.querySelector("svg");
    // Don't allow full code if any attribute is onClick or something
    if (Array.from(innerSVG?.attributes).some((a) => a.name.startsWith("on")))
        innerSVG = undefined;
    // Don't allow full code if it contains <script> tags
    if (innerSVG?.getElementsByTagName("script").length) innerSVG = undefined;
/**/

    return { viewBox, path, badgePath, paths: sumpath, format, innerSVG };
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

// Fullcolor support patch
customElements.whenDefined("ha-icon").then((HaIcon) => {
    const orig = HaIcon.prototype._setCustomPath;
    HaIcon.prototype._setCustomPath = async function (promise, requestedIcon) {
        await orig?.bind(this)?.(promise, requestedIcon);
  
        const icon = await promise;
        if (requestedIcon !== this.icon) return;
        if (!icon.innerSVG || icon.format !== "fullcolor") return;
  
        await this.UpdateComplete;
        const el = this.shadowRoot.querySelector("ha-svg-icon");
        await el?.updateComplete;
  
        this._path = undefined;
        this._badgePath = undefined;
  
        const root = el?.shadowRoot.querySelector("svg");
        root?.appendChild(icon.innerSVG.cloneNode(true));
    };
});