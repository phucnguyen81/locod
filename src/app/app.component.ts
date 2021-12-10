import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'locod';
  clipboardText = '';

  copy(event: Event): void {
    event.preventDefault();
    console.log('Copy is clicked');
  }

  paste(event: Event): void {
    event.preventDefault();
    navigator.clipboard
      .readText()
      .then((text: string) => {
        this.clipboardText = text;
        console.log('Pasted: ' + this.clipboardText);
      })
      .catch((error: any) => {
        alert('Failed to read from clipboard: ' + String(error));
      });
  }
}
