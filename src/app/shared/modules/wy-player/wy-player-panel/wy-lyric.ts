/**
 * 解析网易歌词
 */

import { Lyric } from '@shared/interfaces/common'
import { from, iif, Subject, Subscription, timer, zip } from 'rxjs'
import { skip } from 'rxjs/operators'

export interface BaseLyricLine {
  txt: string
  txtCn: string
}

interface LyricLine extends BaseLyricLine {
  time: number
}

interface Handler extends BaseLyricLine {
  lineNum: number
}

const timeExp = /\[(?<minute>\d{1,2}):(?<seconds>\d{2})(?:\.(?<milliseconds>\d{2,3}))?\]/

export class WyLyric {
  lines: LyricLine[] = [] // 歌词数据
  handler$ = new Subject<Handler>() // 供外部订阅的数据源（行数）

  private playing = false
  private curNum: number = 0
  private startStamp: number = 0 // 歌曲开始播放的时间戳
  private pauseStamp: number = 0
  private timer$?: Subscription // 内部定时器

  constructor(private readonly lrc: Lyric) {
    this.init()
  }

  private init() {
    if (this.lrc.tlyric) {
      this.generTLyric()
    } else {
      this.generLyric()
    }
  }

  // 生成歌词
  private generLyric() {
    const lines = this.lrc.lyric.split('\n')
    for (let i = 0; i < lines.length; i++) {
      this.makeLine(lines[i])
    }
  }

  // 生成翻译歌词
  private generTLyric() {
    const lines = this.lrc.lyric.split('\n')
    // 挑出翻译歌词到主歌就可以了
    const tlines = this.lrc.tlyric.split('\n').filter((item) => timeExp.exec(item) !== null)
    const moreLine = lines.length - tlines.length
    const tempArr = moreLine >= 0 ? [lines, tlines] : [tlines, lines]

    const result = timeExp.exec(tempArr[1][0])
    const first = result && result[0] // [00.00.000]

    const skipIndex = tempArr[0].findIndex((item) => {
      const exec = timeExp.exec(item)
      return exec ? exec[0] === first : false
    })
    const _skip = skipIndex === -1 ? 0 : skipIndex
    const skipItems = tempArr[0].slice(0, _skip)
    if (skipItems.length) {
      // 先把一些不需要翻译的行推进去
      skipItems.forEach((line) => this.makeLine(line))
    }

    const zipLines$ = iif(
      () => moreLine > 0,
      zip(from(lines).pipe(skip(_skip)), from(tlines)),
      zip(from(lines), from(tlines).pipe(skip(_skip)))
    )
    zipLines$.subscribe(([line, tline]) => this.makeLine(line, tline))
  }

  // 核心方法：转换歌词对象
  private makeLine(line: string, tline = '') {
    const result = timeExp.exec(line)
    if (result) {
      const txt = line.replace(timeExp, '').trim()
      const txtCn = tline && tline.replace(timeExp, '').trim()
      if (txt) {
        const thirdResult = result[3] || '00'
        const millisecond = thirdResult.length > 2 ? parseInt(thirdResult) : parseInt(thirdResult) * 10
        const time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + millisecond

        this.lines.push({ txt, txtCn, time })
      }
    }
  }

  //#region 无关转换的方法
  play(startTime = 0, skipLast = false) {
    if (!this.lines.length) {
      return
    }
    this.playing = true
    this.curNum = this.findCurNum(startTime)
    this.startStamp = Date.now() - startTime

    if (!skipLast) {
      this.callHandler(this.curNum - 1)
    }

    if (this.curNum < this.lines.length) {
      // 播放行数不能越界
      this.clearTimer()
      this.playReset()
    }
  }

  togglePlay(playing: boolean) {
    const now = Date.now()

    this.playing = playing
    if (playing) {
      // 继续播放
      const startTime = (this.pauseStamp || now) - (this.startStamp || now)
      this.play(startTime, true)
    } else {
      // 暂停播放
      this.stop()
      this.pauseStamp = now
    }
  }

  // 暂停播放
  stop() {
    this.playing = false
    this.clearTimer()
  }

  // 根据播放进度调整当前行数
  seek(offset: number) {
    this.play(offset)
  }

  /** 循环播放下一行，类似于任务编排，延迟 0, 1, 3, 9 ...秒发射一次当前行 */
  private playReset() {
    const line = this.lines[this.curNum]
    const delay = line.time - (Date.now() - this.startStamp)
    this.timer$ = timer(delay).subscribe(() => {
      this.callHandler(this.curNum++)
      if (this.curNum < this.lines.length && this.playing) {
        // 播放行数不能越界，且正在播放
        this.playReset()
      }
    })
  }

  /** 清理定时器 */
  private clearTimer() {
    this.timer$ && this.timer$.unsubscribe()
  }

  /** 核心方法：把当前播放行发射出去 */
  private callHandler(i: number) {
    if (i > 0) {
      // 一开始播放本来就在第一行，不需要发射值出去
      const { txt, txtCn } = this.lines[i]
      this.handler$.next({ txt, txtCn, lineNum: i })
    }
  }

  /** 根据时间找到最近的播放行数 */
  private findCurNum(time: number): number {
    for (let i = 0; i < this.lines.length; i++) {
      if (time <= this.lines[i].time) {
        return i
      }
    }
    return this.lines.length - 1
  }
  //#endregion
}
