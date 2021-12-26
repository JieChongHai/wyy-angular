import { Injectable, Injector } from '@angular/core'
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponseBase,
  HttpErrorResponse,
} from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'
import { NzNotificationService } from 'ng-zorro-antd/notification'

const CODEMESSAGE: { [key: number]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
}

@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService)
  }

  constructor(private injector: Injector) {}

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText
    console.error(`请求错误 ${ev.status}: ${ev.url}`, errortext)
    // this.notification.error(`请求错误 ${ev.status}: ${ev.url}`, errortext)
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev)
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        // if (ev instanceof HttpResponse) {
        //   const body = ev.body;
        //   if (body && body.status !== 0) {
        //     this.injector.get(NzMessageService).error(body.msg);
        //     // 注意：这里如果继续抛出错误会被行254的 catchError 二次拦截，导致外部实现的 Pipe、subscribe 操作被中断，例如：this.http.get('/').subscribe() 不会触发
        //     // 如果你希望外部实现，需要手动移除行254
        //     return throwError({});
        //   } else {
        //     // 忽略 Blob 文件体
        //     if (ev.body instanceof Blob) {
        //        return of(ev);
        //     }
        //     // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
        //     return of(new HttpResponse(Object.assign(ev, { body: body.response })));
        //     // 或者依然保持完整的格式
        //     return of(ev);
        //   }
        // }
        break
      case 401:
      case 403:
      case 404:
      case 500:
        break
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            '未可知错误，大部分是由于后端不支持跨域CORS或无效配置引起，请参考 https://ng-alain.com/docs/server 解决跨域问题',
            ev
          )
        }
        break
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev.error)
    } else {
      return of(ev)
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const newReq = request.clone({ withCredentials: true })
    return next.handle(newReq).pipe(catchError((err: HttpErrorResponse) => throwError(err.error)))
  }
  //   return next.handle(newReq).pipe(
  //     mergeMap((ev) => {
  //       // 允许统一对请求错误处理
  //       if (ev instanceof HttpResponseBase) {
  //         return this.handleData(ev, newReq, next)
  //       }
  //       // 若一切都正常，则后续操作
  //       return of(ev)
  //     }),
  //     catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
  //   )
  // }
}
