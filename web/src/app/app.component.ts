import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as rx from 'rxjs';
import * as op from 'rxjs/operators';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly socket: Socket = io();

  private maxItems = 10;
  private clipboardIntervalMillis = 1000;

  toggleChecked = true;

  get toggleTooltip(): string {
    return 'Monitor Clipboard: ' + (this.toggleChecked ? 'On' : 'Off');
  }

  textControls: FormControl[] = [];

  private socketText$ = new rx.ReplaySubject<string>(1);

  private navigatorText$: rx.Observable<string> = rx
    .interval(this.clipboardIntervalMillis)
    .pipe(
      op.switchMap(() => {
        if (document.hasFocus() && navigator.clipboard) {
          return rx.from(navigator.clipboard.readText());
        } else {
          return rx.EMPTY;
        }
      })
    );

  private clipboardText$: rx.Observable<string> = rx
    .merge(this.socketText$, this.navigatorText$)
    .pipe(op.distinctUntilChanged());

  private subscription = new rx.Subscription();

  ngOnInit(): void {
    this.socket.emit('notify-clipboard');
    this.socket.on('clipboard:text', (msg: string) =>
      this.socketText$.next(msg)
    );

    this.subscription.add(
      this.clipboardText$
        .pipe(
          op.tap((text) => {
            this.textControls.unshift(new FormControl(text));
            if (this.textControls.length > this.maxItems) {
              this.textControls.pop();
            }
          }),
          op.catchError((error) => {
            console.log(error);
            return rx.EMPTY;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.socket.emit('stop-notify-clipboard');
  }

  // Write text content of an item to clipboard
  copy(event: Event, textControl: FormControl): void {
    event.preventDefault();
    const text = textControl.value;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Copied to clipboard');
      })
      .catch((error) => {
        console.log('Copied to clipboard: Failed: ' + String(error));
      });
  }
}
