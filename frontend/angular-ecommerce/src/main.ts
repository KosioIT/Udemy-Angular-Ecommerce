import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { importProvidersFrom } from "@angular/core";
import { AuthModule } from "@auth0/auth0-angular";
import { RouterModule } from "@angular/router";
import { routes } from "../src/app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      AuthModule.forRoot({
        domain: "dev-uy61t80zo02jnf8h.us.auth0.com",
        clientId: "wKVq1aEigiefYQpetQtPL6JytPcdmFP6",
        authorizationParams: {
          redirect_uri: window.location.origin,
          audience: "https://localhost:8080/api/",
        },
        httpInterceptor: {
          allowedList: [
            {
              uri: "https://localhost:8080/api/*",
            },
          ],
        },
      }),
      RouterModule.forRoot(routes)
    ),
  ],
});