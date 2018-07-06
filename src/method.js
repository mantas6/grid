import { entries } from 'lodash';
import chroma from 'chroma-js';

export function colorByContent(content, size) {
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

    const color = chroma(colorName);

    color.darken(blackAmount / size);

    return { 'background-color': color.css() };
}

export function colorByName(name) {
    const color = chroma(name);

    return { 'background-color': color.css() };
}
