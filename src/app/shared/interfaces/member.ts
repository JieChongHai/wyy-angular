import { Song, SongSheet } from './common'

export interface LoginParams {
  phone: string
  password: string
  remember: boolean
}

export interface Signin {
  code: number
  point?: number
  msg?: string
}

export interface User {
  // 等级
  level?: number

  // 听歌记录
  listenSongs?: number

  profile: {
    userId: number
    nickname: string
    avatarUrl: string
    backgroundUrl: string
    signature: string

    // 性别
    gender: number

    // 粉丝
    followeds: number

    // 关注
    follows: number

    // 动态
    eventCount: number
  }
}

export interface RecordVal {
  playCount: number
  score: number
  song: Song
}

type recordKeys = 'weekData' | 'allData'

export type UserRecord = {
  [key in recordKeys]: RecordVal[]
}

export interface UserSheet {
  self: SongSheet[]
  subscribed: SongSheet[]
}

export enum RecordType {
  allData,
  weekData,
}
export interface LikeSongParams {
  pid: string
  tracks: string
}

export enum ShareType {
  Song = 'song',
  Playlist = 'playlist',
}
export interface ShareParams {
  id: string
  msg: string | null
  type: ShareType
}

export interface ICreateSheet {
  sheetName: string
}
