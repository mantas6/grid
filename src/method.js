import { entries } from 'lodash';
import chroma from 'chroma-js';

export function colorByContent(content) {
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
    color = color.brighten();

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