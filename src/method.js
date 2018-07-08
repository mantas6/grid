import { entries, clamp } from 'lodash';
import chroma from 'chroma-js';

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
        energyMax: 'dodgerBlue',
        absorbStrength: 'chocolate',
        absorbEff: 'burlyWood',
        processSpeed: 'darkGoldenRod',
        health: 'crimson',
        spread: 'magenta',
    };

    return chroma(map[name]);
}