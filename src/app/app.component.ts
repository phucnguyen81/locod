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
  tickIntervalInMillis = 1000;
  pasteIntervalInMillis = 2000;

  title = 'locod';

  subscription = new rx.Subscription();

  // tick$: events generated periodically
  tick$: rx.Observable<Tick> = rx.interval(this.tickIntervalInMillis).pipe(
    op.map((index) => ({
      index,
      duration: this.tickIntervalInMillis,
      hasFocus: document.hasFocus(),
    }))
  );

  // paste$: paste events sampled every 2 seconds
  paste$: rx.Observable<Tick> = this.tick$.pipe(
    op.sample(rx.interval(this.pasteIntervalInMillis))
  );

  textControl = new FormControl('');

  pasteIntervalID = 0;

  ngOnInit(): void {
    this.subscription.add(
      this.paste$
        .pipe(
          op.tap(() => {
            this.paste(new Event('paste'));
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
