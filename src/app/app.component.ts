import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'locod';

  tickDuration = 1000;

  textControl = new FormControl('');

  pasteIntervalID = 0;

  ngOnInit(): void {
    this.startPaste();
  }

  ngOnDestroy(): void {
    this.stopPaste();
  }

  // Read from clipboard periodically and write to textarea
  startPaste(): void {
    const paste = () => this.paste(new Event('custompaste'));
    this.pasteIntervalID = window.setInterval(paste, 3 * this.tickDuration);
  }

  // Cancel the paste calls
  stopPaste() {
    window.clearInterval(this.pasteIntervalID);
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
