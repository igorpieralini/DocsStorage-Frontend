import { provideServerRendering } from '@angular/platform-server';

export const config = {
  providers: [
    provideServerRendering()
  ]
};
