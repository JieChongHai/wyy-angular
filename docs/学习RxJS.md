## 核心概念

### ReactiveX 

> 两个**要解决的问题**：
>
> - 非同步编程(Asynchronous programming)
> - 串流(Stream)
>
> 三个**程式设计方式**：
>
> - 观察者模式(Observer pattern)
> - 迭代器模式(Iterator pattern)
> - 函数式语言程序设计(Functional programming)

## Observable

如何开始，create(**Observable**) => Combine(**Operators**) => Listen(**subscribe**)

建立新的Observable

- 自己从头开始建立新的资料（Subject）
- 利用现有的数据或事件来建立（fromEvent、of、......）

观察者模式

> - 观察者(Observer)
>   - `notify`： 当Subject数据变动，会调用Observer的notify 方法，通知数据变动了
> - 目标(Subject)
>   - `notifyObservers`：用来通知所有的Observer数据变动了，也就是调用Observer的notify 方法
>   - `addObserver`：将某个Observer加入Observer List
>   - `deleteObserver`：将某个Observer从Observer List中移除

迭代器模式

> - 迭代器(Iterator)：用来存放集合的内容，除此之外更重要的是提供遍历集合内容的底层实例，并公开出两个方法
>   - `next()`：用来取得目前集合的下一个元素
>   - `hasNext()`：用来判断是否还有下一个元素需要遍历，当没有下一个元素需要遍历时，代表已经遍历过全部的元素
> - 聚合功能(Aggregate)：用来产生迭代器实例的类。

函数式语言程序设计(Functional programming)

> - 多使用 pure function，尽量避免 side effect，更加容易定位错误
> - 善用高阶函数，使用函数作为参数或返回值，使程序更具灵活性
> - 使用 lamda （匿名函数写法）编写更简短的function
> - 采用声明式编程，将程序执行步骤拆成更小、更明确运算单元，让程序更好阅读

命令式编程（Imperative）：详细的命令计算机怎么去处理一件事情以达到你想要的结果

声明式编程（ Declarative）：是以数据结构的形式来表达程序执行的逻辑。告诉计算机应该做什么，但不指定具体要怎么做。

**functional programming 常用的基本技巧：**

- **curry**：将原本的参数拆成好几个小function，每个参数带入后回传的都是准备带入下个参数的function，借此让function 单元更小，重用性更高；建议将真正要执行的data放在最后一个参数，把「fn」和「data」隔离。
- **compoes**：用比较简易的方法把function 调用顺序包起来，让整个运算逻辑变得更加清晰，搭配curry function 有着奇效，在整个调用过程中只要传入一次data，这种设计风格也称为Point Free。
- **pipe**：跟compose 一样是把function 调用包起来，但compose 是符合数学运算的习惯(从右往左)，比较后面的function 会先被调用，pipe 则是设计成比较前面的function 会先调用(从左往右)，更符合一般程序设计的阅读习惯。
- **tap**：输入数据就是输出数据的一个function，重点在会调用传入的callback function，可以通过这种方式将「side effect」和「非side effect」的代码隔开，在代码出现问题时能更容易找到出错的地方。

## Subject 

**Observable**：适合在有**固定数据流程**的情境，先把流程建立好，之后每次订阅都会照这个流程走。

```js
import { Observable } from 'rxjs';

const source$ = new Observable(subscriber => {
  console.log('stream 开始');
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  console.log('stream 结束');
  subscriber.complete();
});

source$.subscribe({
  next: data => console.log(`Observable: ${data}`),
  complete:() => console.log('订阅完成')
});

// 打印结果
stream 开始
Observable: 1
Observable: 2
Observable: 3
stream 结束
订阅完成
```

**Subject**：`Subject`继承自 `Observable` 类，更适合在动态过程中决定数据流向。

1. `Observable`在创建时就决定好数据流向了，而 `Subject` 是在创建后才决定数据的流向。
2. `Observable`每个订阅者都会得到独立的数据流，又称为unicast；而 `Subject` 则是每次事件发生时就会同步传递给所有订阅者(Observer)，又称为multicast。

```js
import { Subject } from 'rxjs';

const source$ = new Subject();

source$.subscribe((data) => console.log(`Subject 第一次订阅: ${data}`));
source$.next(1);
source$.subscribe((data) => console.log(`Subject 第二次订阅: ${data}`));
source$.next(2);
source$.subscribe((data) => console.log(`Subject 第三次订阅: ${data}`));
source$.complete();

// 打印结果
Subject 第一次订阅: 1
Subject 第一次订阅: 2
Subject 第二次订阅: 2
```

**BehaviorSubject**：保留最近一次数据

```js
import { BehaviorSubject } from 'rxjs';
const source$ = new BehaviorSubject(0);

source$.subscribe((data) => console.log(`BehaviorSubject: ${data}`));

// 打印结果
BehaviorSubject: 0
```

**ReplaySubject**：保留最近N次数据

```js
import { ReplaySubject } from 'rxjs';

const source$ = new ReplaySubject(2);

source$.subscribe((data) => console.log(`ReplaySubject 第一次订阅: ${data}`));
source$.next(1);
source$.next(2);
source$.subscribe((data) => console.log(`ReplaySubject 第二次订阅: ${data}`));

// 打印结果
ReplaySubject 第一次订阅: 1
ReplaySubject 第一次订阅: 2
ReplaySubject 第二次订阅: 1
ReplaySubject 第二次订阅: 2
```

**AsyncSubject**：只获取最后一次数据

```js
import { AsyncSubject } from 'rxjs';

const source$ = new AsyncSubject();

source$.subscribe((data) => console.log(`AsyncSubject 第一次订阅: ${data}`));

source$.next(1);
source$.next(2);

source$.subscribe((data) => console.log(`AsyncSubject 第二次订阅: ${data}`));

source$.next(3);
source$.next(4);

source$.subscribe((data) => console.log(`AsyncSubject 第三次订阅: ${data}`));

source$.complete();

// 打印结果
AsyncSubject 第一次订阅: 4
AsyncSubject 第二次订阅: 4
AsyncSubject 第三次订阅: 4
```

共用API - asObservable（将 `Subject` 当作 `Observable` 回传，将发送新事件等行为封装起来不被外界使用！）

## Cold Observable 与Hot Observable

- **Cold Observable**：在每次订阅时，完整的数据流会重新产生；数据流与订阅者是一对一的关系。（参考Observable 的使用）
- **Hot Observable**：在订阅前数据流就已经开始了，每个订阅者订阅的都是同一个数据流；数据流与订阅者是一对多的关系。（参考Subject 的使用）
- **Warm Observable**：在第一次订阅开始前不会启动数据流，直到第一次订阅发生启动，所有观察者都是订阅同一个数据流；数据流与订阅者是一对多关系。

> 什么时候用到 Warm Observable ？
>
> 有些时候我们会先设计好一个Cold Observable，但又不希望每次订阅时都要重新来过(例如HTTP 请求、WebSocket 等)，就很适合把unicast 转成multicast 类型的Observable！

## Operators 

`EMPTY`就是一个空的Observable，没有任何事件，就直接结束了。

`of` 就是将传进去的值当作一条 Observable，当值都发送完后结束。

`range` 顾名思义就是依照一个范围内的数列（1、2、3、4 ......）数据建立 Observable，

包含两个参数： 

- start: 从哪个数值开始 
- count: 建立多少个数值的数列

```js
import { range } from 'rxjs';

range(3, 4).subscribe((data) => console.log(`range: ${data}`));

// 打印结果
range: 3
range: 4
range: 5
range: 6
```

`iif` 会通过条件来决定产生怎么样的 Observable，有三个参数： 

- condition: 传入一个 function，这个 function 会回传布尔值。 
- trueResult: 当调用 condition 参数的 function 回传 true 时，使用 trueResult 的 Observable 
- falseResult: 当调用 condition 参数的 function 回传 false 时，使用 falseResult 的 Observable

```js
import { iif, of, EMPTY } from 'rxjs';

const data = 2;
iif(() => data % 2 === 0, of('Hello'), EMPTY).subscribe((data) =>
  console.log(`iif: ${data}`)
);

// 打印结果
iif: Hello
```

`throwError` 就是用来让整条 Observable 发生错误 (error()) 用的！因此订阅时要记得使用 error 来处理，同时当错误发生时，就不会有「complete」发生。

`ajax` 调用一个 HTTP 请求作为 Observable 的事件数据。

`from` 使用数组、Promoise、Observable 等来源建立新的 Observable。

`fromEvent` 封装 DOM 的 addEventListener 事件处理来建立 Observable。 

`fromEvenPattern` 可依照自行定义的事件来建立 Observable，需要传入两个参数：  

- addHandler：当 subscribe 时，调用此方法决定如何处理事件逻辑 
- removeHandler：当 unsubscribe 时，调用此方法将原来的事件逻辑取消

`interval` 每隔指定的时间发出一次事件值。 

`timer` 与 interval 相同，但可以设定起始的等待时间。 

`defer` 用来延迟执行内部的 Observable。比 `iif` 更灵活，而且当回传的数据为Promise时，也不会立马调用，要等到 subscribe的时候Promise才会执行。

```js
// 将 Promise 包成起来
// 因此在此 function 被调用前，都不会执行 Promise 内的代码
const promiseFactory = () => new Promise((resolve) => {
  console.log('Promise 被执行了');
  setTimeout(() => resolve(100), 1000);
});
const deferSource$ = defer(promiseFactory);
// 此时 Promise 内代码依然不会被执行
console.log('示范用 defer 解决 Promise 的问题:');
// 直到被订阅了，才会调用里面的 Promise 内的代码
deferSource$.subscribe(result => {
  console.log(`Promise 结果: ${result}`)
});
```

`concat` 用来「串接」数个 Observables，会依序执行每个 Observable，上一个 Observable 「完成」后才会执行下一个 Observable。 

`merge` 用来「同时执行」数个 Observables，所有 Observables 会同时执行，并只在一条新的 Observable 上发生事件。 

`zip` 一样「同时执行」数个 Observables，差别是会将每个 Observable 的数据「组合」成一个新的事件值，在新的 Observable 上发生新事件。

`partition` 依照指定逻辑，将一条 Observable 拆成两条 Observables。

`combineLatest` 同时订阅所有内部 Observables，并将内部 Observables 里面的最后一次事件数据组合起来。（会等待所有输入 Observable 至少发出一次数据，然后才开始发出结果）

`forkJoin` 同时订阅所有内部 Observables，并将内部 Observables 「完成」前的最后一个事件数据组合起来。（所有给定的 observables 必须至少发出一次并完成）

`race` 同时订阅所有内部 Observables，当其中一个 Observable 先发生第一次事件后，以此 Observable 为主，并将其他 Observable 取消订阅。

`map` 就是把 Observable 每次「事件的值」换成「另外一个值」

`scan` 需要传入两个参数 

- 累加函数：这个函数被调用时会传入三个参数，可以搭配这三个参数处理资料后回传一个累加结果，函数参数包含 

  - acc：目前的累加值，也就是上一次调用累加函数时回传的结果 

  - value：目前事件值 

  - index：目前事件 index 

- 初始值

```js
of(1, 2, 3, 4, 5, 6).pipe(
  scan(
    (accu, value) => ([accu === null ? null : accu[1], value]),
    null
  )
).subscribe(data => {
  console.log(data);
});

// 打印结果
[null, 1]
[1, 2]
[2, 3]
[3, 4]
[4, 5]
[5, 6]
```

`pairwise` 将当前值和先前值放在一起作为一个数组，并发出它。（即将 Observable 的值「成双成对」的输出）

`switchMap`「切换」的概念，退订阅上次未完成的数据流，订阅新的数据流；若有新事件时过去的数据就不重要了，可以使用此 operator。 

`mergeMap` 上次数据流若未完成，不会退订阅，且继续订阅新的数据流；若数据流顺序相对不重要，可以使用此 operator，整体效率会比较快。 

`concatMap` 持续等到上次数据流完成，才继续订阅新的数据流；若执行顺序非常重要，可以使用此 opereator；不过要注意每次转换的 Observable 都需要有完成，否则永远不会进入下一个 Observable。 

`exhaustMap` 若上次数据流未完成，则忽略订阅这次的数据流；若希望避免产生太多数据流，可以考虑使用此 operator。

`xxxAll` 系列和 `xxxMap` 系列（xxx为switch、merge、concat）处理「上一个」数据流的方式一样，差别在于 xxxAll 是使用别人传给我们的 Observable of Observable，而 xxxMap 必须自行撰写转换成 Observable 的规则 。 

`cominbeAll` 和 combineLatest 行为也非常类似，combineAll 的资料来源是 Observable of Observable，而 combineLatest 则必须明确指定要组合哪写 Observables。

`startWith` 适合用在一些希望订阅 Observable 时就能够有一个预设值的情境。

`filter` 用来依照指定的条件过滤事件值，只有符合条件的事件值会发生。 

`first` 只有第一个事件值会发生，若有指定条件会变成符合条件的第一个事件值会发生。 

`last` 只有最后一个事件值会发生，若有指定条件会变成符合条件的最后一个事件值会发生。

 `single` 可以用来确保整个 Observable 「只会发生一次事件」，没有指定条件时，发生两次以上事件会发生错误；有指定条件时，发生两次以上事件会产生 undefined 事件值。

`take` 代表要让前 N 次事件可以发生，符合数量后结束目前的 Observable。 

`takeLast` 代表要让后 N 次事件可以发生，因此需要来源 Observable 结束。 

`takeUntil` 会持续让来源 Observable 事件发生，直到指定的另一个 Observable 发生新事件了，结束目前的 Observable。 

`takeWhile` 可以判断资料是否符合条件，只要资料符合条件，事件就会持续发生，当资料不符合条件，目前的 Observable 就会结束。还有一个 inclusive 参数，代表是否要包含判断不符合条件的那个值，当设为 true 时，发生结束条件的那次事件值也会被包含在要发生的事件内

`skip` 从订阅开始后忽略指定数量的事件值。 

`skipLast` 依照指定的数量，忽略整个 Observable 最后的事件值。 (不会等到最后一个值发出，会尽快发出值，即当发出前指定的数量后)

```js
import { of } from 'rxjs';
import { skipLast } from 'rxjs/operators';

const numbers = of(1, 2, 3, 4, 5);
const skipLastTwo = numbers.pipe(skipLast(2));
skipLastTwo.subscribe(x => console.log(x));

// Results in:
// 1 2 3
// (4 and 5 are skipped)
```

`skipUntil` 持续忽略目前 Observable 的事件资料，直到另一个 Observable 发生事件为止。

`skipWhile` 持续忽略目前 Observable 的事件资料，直到事件资料值不符合指定条件为止。

`distinct` 用来过滤「重复」的事件值发生，distinct 会把出现过的事件值记录下来，当事件资料曾经出现过，就不让事件发生，我们也可以自己决定何时要把这个纪录清除。 

`distinctUntilChanged` 如果事件值「持续重复」就会被过滤掉，直到这次事件值与上次事件值不同时，才允许事件发生。

`distinctUntilKeyChanged` 与 distinctUntilChanged 逻辑一样，但提供了比较简单的方式，让我们处理事件对象的某个属性就是 key 值的情境。

`sampleTime` 每个一个循环时间取一次时间区段内来源 Observable 最新的资料 

`sample` 依照指定的 Observable 事件发生时机来取时间区段内来源 Observable 最新的资料 

`auditTime` 当来源 Observable 有新事件发生时，依照指定时间取得事件发生后这段时间内来源 Observable 最新的资料 

`audit` 当来源 Observable 有新事件发生时，依照另外一个 Observable 来决定要在多长的时间内取得来源 Observable 最新的资料 

`debounceTime` 当来源 Observable 有新事件发生时，须在指定时间内没有新的事件发生，才允许此事件发生在新的 Observable 上 

`debounce` 当来源 Observable 有新事件发生时，依照另外一个 Observable 来决定要再多长时间内没有新的事件发生，才允许此事件发生在新的 Observable 上

`isEmpty` 用来判断来源 Observable 是否是空的，也就是没有任何事件发生就结束了。 

`defaultIfEmpty` 当来源 Observable 是空的时候，给予一个预设值。

`find` 用来判断来源 Observable 是否有符合条件的事件资料，如果有，将此事件资料发生在新的 Observable 上，并结束。 

`findIndex` 用来判断来源 Observable 是否有符合条件的事件资料，如果有，将此事件资料在来源 Observable 的索引值发生在新的 Observable 上，并结束。 

`every` 用来判断来源 Observable 的事件是否「全部符合指定条件」。

`min` 找出来源 Observable 事件的最小值。（等待事件结束）

`max` 找出来源 Observable 事件的最大值。（等待事件结束）

`count` 找出来源 Observable 事件总数。（等待事件结束）

`reduce` 依照指定运算逻辑，找出来源 Observable 事件汇总的结果。（等待事件结束）

`tap` 可以用来隔离「side effect」以及「非 side effect」，在 Observable 运作过程中，不论是 next()、error()或complete()，只要有 side effect 逻辑都建议放到 tap 内处理。

`toArray` 将来源 Observable 资料汇整成一个阵列。 toArray 可以应用来处理阵列资料。 （等待事件结束）

delay` 延迟一段时间后，才开始运行来源 Observable。 

`delayWhen` 可自行设计 Observable，来决定来源 Observable 每个事件的延迟逻辑。

`catchError` 可以用来决定当来源 Observable 发生错误时该如何进行，回传一个 Observable 代表会使用此 Observable 继续下去，因此回传 throwError 则代表依然发生错误。

`retry` 当来源 Observable 发生错误时，重新尝试指定次数。

`retryWhen` 当来源 Observable 发生错误时，可以照自定的 Observable 来决定重试的时机。

`finalize` 在 Observable 结束时，无论是 error() 还是 complete()，最后都可以进入 finalize 进行最终处理。

















## Schedulers



## 实战应用

1、股价资讯提示

```js
import { from } from 'rxjs';
import { map, pairwise, scan } from 'rxjs/operators';

const priceHistories = [100, 98, 96, 102, 99, 105, 105];

const source$ = from(priceHistories).pipe(
  pairwise(),
  map(([yesterdayPrice, todayPrice], index) => ({
    day: index + 2,
    todayPrice,
    // 计算是否上涨下跌
    priceUp: todayPrice > yesterdayPrice,
    priceDown: todayPrice < yesterdayPrice,
  })),
  // 逐步计算股价小于 100 的天数
  scan(
    (accu, value) => ({
      ...value,
      // 股价小于 100，天数 + 1
      priceBelow100Days:
        accu.priceBelow100Days + (value.todayPrice < 100 ? 1 : 0),
    }),
    {
      day: 1,
      todayPrice: 0,
      priceUp: false,
      priceDown: false,
      priceBelow100Days: 0,
    }
  )
);

source$.subscribe((data) => {
  console.log(`第 ${data.day} 天`);
  console.log(`本日股价: ${data.todayPrice}`);
  console.log(
    `本日股价 ${data.priceUp ? '上涨' : data.priceDown ? '下跌' : '持平'}`
  );
  console.log(`历史股价小于 100 的有 ${data.priceBelow100Days} 天`);
});

// 打印结果
第 2 天
本日股价: 98
本日股价 下跌
历史股价小于 100 的有 1 天
第 3 天
本日股价: 96
本日股价 下跌
历史股价小于 100 的有 2 天
第 4 天
本日股价: 102
本日股价 上涨
历史股价小于 100 的有 2 天
第 5 天
本日股价: 99
本日股价 下跌
历史股价小于 100 的有 3 天
第 6 天
本日股价: 105
本日股价 上涨
历史股价小于 100 的有 3 天
第 7 天
本日股价: 105
本日股价 持平
历史股价小于 100 的有 3 天
```



## 参考文章

>  [打通 RxJS 任督二脈 系列](https://ithelp.ithome.com.tw/users/20020617/ironman/2959)
>  [弹珠图网站](https://rxmarbles.com/)
>  [学习操作符](https://reactive.how/)