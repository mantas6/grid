import { entries, clamp } from 'lodash';
import chroma from 'chroma-js';

export function colorByName(name, foreground) {
    const color = nameToColor(name);
    const brightenedColor = color.brighten(1.5);

    if (foreground) {
        return { 'color': brightenedColor.css() };
    } else {
        return { 'background-color': brightenedColor.css() };
    }

}

export function nameToColor(name) {
    const map = {
        dirt: 'black',
        energy: 'green',
        acid: 'cyan',
        energyMax: 'crimson',
        healthMax: 'fireBrick',
        absorbStrength: 'chocolate',
        absorbEff: 'burlyWood',
        processSpeed: 'darkGoldenRod',
        health: 'crimson',
        spread: 'magenta',
        crystalize: 'midnightBlue',
        damage: 'red',
        weaken: 'yellow',
        grow: 'olive',
        capacity: 'lime',
        sentry: 'hotPink',
    };

    return chroma(map[name]);
}