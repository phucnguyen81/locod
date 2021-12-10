import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'locod';

  copy(event: Event): void {
    event.preventDefault();
    console.log('Copy is clicked');
  }

  paste(event: Event): void {
    event.preventDefault();
    console.log('Paste is clicked');
  }
}
