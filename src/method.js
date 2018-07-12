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
        teleport: 'lightSlateGray',
        attackStrength: 'goldenRod',
    };

    return chroma(map[name]);
}

export function nameToDescription(name) {
    const map = {
        dirt: 'Just occupies your processing container. Get rid of it with acid',
        energy: 'Regenerates your action energy container',
        acid: 'Destroys everything in your energy container except buffs',
        energyMax: 'Increases maximum energy',
        healthMax: 'Increases maximum health',
        absorbStrength: 'Increases amount that is absorbed per click',
        absorbEff: 'Decreases absorption cost per click',
        processSpeed: 'Increases processing speed',
        health: 'Restores health',
        spread: 'Spits container contents to nearby cells',
        crystalize: 'Converts cell container contents to item',
        damage: 'Inflicts damage to players health',
        weaken: 'Drains players stamina',
        grow: 'Grows the current content of the container',
        capacity: 'Increases processing container capacity',
        sentry: 'Transfers content to the nearest player in the vicinity',
        teleport: 'Used to teleport to the nearest players',
        attackStrength: 'Damage multiplier when attacking other players',
    };

    return map[name];
}