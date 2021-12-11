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
  title = 'locod';

  textControl = new FormControl('');

  private clipboardIntervalMillis = 1000;

  private clipboardText$: rx.Observable<string> = rx
    .interval(this.clipboardIntervalMillis)
    .pipe(
      op.switchMap(() => {
        if (document.hasFocus()) {
          return rx.from(navigator.clipboard.readText());
        } else {
          return rx.EMPTY;
        }
      })
    );

  private subscription = new rx.Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.clipboardText$
        .pipe(
          op.tap((text) => {
            this.textControl.setValue(text);
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
  copy(event: Event): void {
    event.preventDefault();
    const text = this.textControl.value;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied');
      })
      .catch((error) => {
        console.log('Failed to write to clipboard: ' + String(error));
      });
  }

  // Read from clipboard and write to textarea
  paste(event: Event): void {
    event.preventDefault();
    if (document.hasFocus()) {
      navigator.clipboard
        .readText()
        .then((text: string) => {
          this.textControl.setValue(text);
        })
        .catch((error: any) => {
          console.log('Failed to read from clipboard: ' + String(error));
        });
    }
  }
}
