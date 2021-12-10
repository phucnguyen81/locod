import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'locod';

  textControl = new FormControl('');

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
        alert('Failed to write to clipboard: ' + String(error));
      });
  }

  // Read from clipboard and write to textarea
  paste(event: Event): void {
    event.preventDefault();
    navigator.clipboard
      .readText()
      .then((text: string) => {
        this.textControl.setValue(text);
        console.log('Pasted: ' + text);
      })
      .catch((error: any) => {
        alert('Failed to read from clipboard: ' + String(error));
      });
  }
}
