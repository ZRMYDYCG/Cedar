import * as migration_20260808_191233_initial from './20260808_191233_initial'
import * as migration_20260809_071200_media_prefix from './20260809_071200_media_prefix'
import * as migration_20260809_080000_moments from './20260809_080000_moments'
import * as migration_20260809_174500_site_settings from './20260809_174500_site_settings'
import * as migration_20260809_213000_comments from './20260809_213000_comments'

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
  },
  {
    up: migration_20260809_174500_site_settings.up,
    down: migration_20260809_174500_site_settings.down,
    name: '20260809_174500_site_settings'
  },
  {
    up: migration_20260809_213000_comments.up,
    down: migration_20260809_213000_comments.down,
    name: '20260809_213000_comments'
  }
]
