import { createReducer, on, Action } from '@ngrx/store'
import { CurrentActions, PlayMode, PlayModeLabel, PlayModeType, Song } from '@shared/interfaces/common'
import {
  SetCurrentAction,
  SetCurrentIndex,
  SetPlaying,
  SetPlayList,
  SetPlayMode,
  SetSongList,
} from '../actions/player.actions'

export const initialState: PlayState = {
  playing: false,
  songList: [],
  playList: [],
  playMode: { type: PlayModeType.Loop, label: PlayModeLabel.Loop },
  currentIndex: -1,
  currentAction: CurrentActions.Other,
}

const _reducer = createReducer(
  initialState,
  on(SetPlaying, (state, { playing }) => ({ ...state, playing })),
  on(SetPlayList, (state, { playList }) => ({ ...state, playList })),
  on(SetSongList, (state, { songList }) => ({ ...state, songList })),
  on(SetPlayMode, (state, { playMode }) => ({ ...state, playMode })),
  on(SetCurrentIndex, (state, { currentIndex }) => ({ ...state, currentIndex })),
  on(SetCurrentAction, (state, { currentAction }) => ({ ...state, currentAction }))
)

export function playerReducer(state: PlayState | undefined, action: Action) {
  return _reducer(state, action)
}

//#region interface
export interface PlayState {
  playing: boolean // 播放状态
  playMode: PlayMode // 播放模式
  songList: Song[] // 歌曲列表
  playList: Song[] // 播放列表
  currentIndex: number // 当前正在播放的索引
  currentAction: CurrentActions // 当前操作
}
//#endregion