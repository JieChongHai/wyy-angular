import { createAction, props } from '@ngrx/store';
import { CurrentActions, PlayMode, Song } from 'src/app/shared/interfaces/common';

export const SetPlaying = createAction('[player] Set playing', props<{ playing: boolean }>());
export const SetPlayList = createAction('[player] Set playList', props<{ playList: Song[] }>());
export const SetSongList = createAction('[player] Set songList', props<{ songList: Song[] }>());
export const SetPlayMode = createAction('[player] Set playMode', props<{ playMode: PlayMode }>());
export const SetCurrentIndex = createAction('[player] Set currentIndex', props<{ currentIndex: number }>());
export const SetCurrentAction = createAction('[player] Set currentAction', props<{ currentAction: CurrentActions }>());
