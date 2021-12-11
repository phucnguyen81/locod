import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as rx from 'rxjs';
import * as op from 'rxjs/operators';

interface Tick {
  index: number;
  duration: number;
  hasFocus: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private maxItems = 10;
  private clipboardIntervalMillis = 1000;

  textControls: FormControl[] = [];

  private clipboardText$: rx.Observable<string> = rx
    .interval(this.clipboardIntervalMillis)
    .pipe(
      op.switchMap(() => {
        if (document.hasFocus()) {
          return rx.from(navigator.clipboard.readText());
        } else {
          return rx.EMPTY;
        }
      }),
      op.distinctUntilChanged()
    );

  private subscription = new rx.Subscription();

  ngOnInit(): void {
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
  }

  // Read from textarea and write to clipboard
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
