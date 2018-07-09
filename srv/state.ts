import { Player } from './class/player';
import { Grid } from './class/grid';

export const globalStatus = { ready: false };
export const players = new Map<number, Player>();
export const playersOnlineIds = new Set<number>();
export const grid = new Grid(32, true);