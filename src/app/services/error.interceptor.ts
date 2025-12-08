import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request:', req.url, req.method);
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        return throwError(() => error);
      })
    );
  }
}
