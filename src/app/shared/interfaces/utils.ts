import { Subject } from 'rxjs'
/** 用来替代 SimpleChanges, 给出更好的类型提示 */
export type NgChanges<Component extends object, Props = ExcludeFunctions<Component>> = {
  [Key in keyof Props]: {
    previousValue: Props[Key]
    currentValue: Props[Key]
    firstChange: boolean
    isFirstChange(): boolean
  }
}
// 第一步: 把 Component 内的函数都标记为 never
type MarkFunctionPropertyNames<Component> = {
  [Key in keyof Component]: Component[Key] extends Function | Subject<any> ? never : Key
}
// 第二步: 提取出上一步不是 never 类型的 key
type ExcludeFunctionPropertyNames<T extends object> = MarkFunctionPropertyNames<T>[keyof T]
// 第三步: 最终在 Component 中找出我们想要的 key
type ExcludeFunctions<T extends object> = Pick<T, ExcludeFunctionPropertyNames<T>>
