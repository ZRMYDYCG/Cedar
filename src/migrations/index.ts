import * as migration_20260808_191233_initial from './20260808_191233_initial';

export const migrations = [
  {
    up: migration_20260808_191233_initial.up,
    down: migration_20260808_191233_initial.down,
    name: '20260808_191233_initial'
  },
];
