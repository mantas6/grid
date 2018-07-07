import { entries, clamp } from 'lodash';
import chroma from 'chroma-js';

export function colorByContent(content, density) {
    let blackAmount = content.black || 0;
    let colorName = 0;
    let colorAmount = 0;

    for (const [ name, amount ] of entries(content)) {
        if (name == 'black')
            continue;
        
        colorName = name;
        colorAmount = amount;
        break;
    }

    let color = nameToColor(colorName);

    color = color.darken(blackAmount / 100);

    const maxAmount = colorAmount || blackAmount;

    color = color.brighten(clamp(1 - Math.min(density, maxAmount) / maxAmount, 0, 2));

    return { 'background-color': color.css() };
}

export function colorByName(name) {
    const color = nameToColor(name);

    return { 'background-color': color.css() };
}

export function nameToColor(name) {
    const map = {
        dirt: 'black',
        energy: 'green',
        acid: 'cyan',
    };

    return chroma(map[name]);
}