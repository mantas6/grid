import { entries, clamp } from 'lodash';
import chroma from 'chroma-js';

// TODO: remove
export function colorByContent(content, density) {
    let blackAmount = content.dirt || 0;
    let colorName = 'white';
    let colorAmount = 0;

    for (const [ name, amount ] of entries(content)) {
        //if (name == 'dirt')
        //    continue;
        
        colorName = name;
        colorAmount = amount;
        break;
    }

    //console.log(colorName)

    let color = nameToColor(colorName);

    color = color.darken(blackAmount / 100);

    const maxAmount = colorAmount || blackAmount;

    const brightenBy = clamp(1 - Math.min(density, maxAmount) / maxAmount, 0, 5);

    // console.log({ blackAmount, colorName, colorAmount, density, maxAmount, brightenBy })

    color = color.brighten(brightenBy * (colorName == 'dirt' ? 6 : 2));

    return { 'background-color': color.css() };
}

export function colorByName(name) {
    const color = nameToColor(name);
    const brightenedColor = color.brighten(1.5);

    return { 'background-color': brightenedColor.css() };
}

export function nameToColor(name) {
    const map = {
        dirt: 'black',
        energy: 'green',
        acid: 'cyan',
    };

    return chroma(map[name]);
}