(()=>{const t="sf_symbols_svg",e={};"customIconsets"in window||(window.customIconsets={}),"customIcons"in window||(window.customIcons={}),window.customIcons.sf={getIcon:s=>((s,o)=>new Promise((async(n,c)=>{const r=`${s}:${o}`;e[r]&&n(e[r]),e[r]=(async(e,s)=>{let o=s;const n=await fetch(`/${t}/icons/${e}/${o}.svg`),c=await n.text(),r=(new DOMParser).parseFromString(c,"text/html");if(!r||!r.querySelector("svg"))return{};const i=r.querySelector("svg").getAttribute("viewBox"),a=r.querySelectorAll("path");let w,u="";for(const t of a)u+=t.getAttribute("d");return w=w??u,{viewBox:i,path:w}})(s,o),n(e[r])})))("regular",s),getIconList:()=>(async()=>{const e=await fetch(`/${t}/list/regular`),s=await e.text();return JSON.parse(s)})()}})();