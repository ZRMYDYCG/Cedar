'use client'

import { create } from 'zustand'
import { createAppActions, type AppStore } from './actions'
import { createAppSliceState } from './slice'

export const useAppStore = create<AppStore>()((...args) => ({
  ...createAppSliceState(),
  ...createAppActions(...args)
}))

export type { AppStore } from './actions'
export type { AppSliceState, LocaleCode, ThemeMode } from './slice'
