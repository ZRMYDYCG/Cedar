import * as migration_20260808_191233_initial from './20260808_191233_initial';
import * as migration_20260809_071200_media_prefix from './20260809_071200_media_prefix';
import * as migration_20260809_080000_moments from './20260809_080000_moments';

export const migrations = [
  {
    up: migration_20260808_191233_initial.up,
    down: migration_20260808_191233_initial.down,
    name: '20260808_191233_initial'
  },
  {
    up: migration_20260809_071200_media_prefix.up,
    down: migration_20260809_071200_media_prefix.down,
    name: '20260809_071200_media_prefix'
  },
  {
    up: migration_20260809_080000_moments.up,
    down: migration_20260809_080000_moments.down,
    name: '20260809_080000_moments'
  }
]
