import { expect, test as base } from "@playwright/test";

type BrowserErrorGuard = {
  allow: (pattern: RegExp) => void;
};

export const test = base.extend<{ browserErrorGuard: BrowserErrorGuard }>({
  browserErrorGuard: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      const expectedBrowserErrors: RegExp[] = [];

      page.on("pageerror", (error) => {
        errors.push(`pageerror: ${error.stack ?? error.message}`);
      });
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`console.error: ${message.text()}`);
        }
      });

      await use({
        allow: (pattern) => expectedBrowserErrors.push(pattern),
      });

      const unexpectedErrors = errors.filter(
        (error) =>
          !expectedBrowserErrors.some((pattern) => pattern.test(error)),
      );

      if (errors.length > 0) {
        await testInfo.attach("browser-errors", {
          body: errors.join("\n\n"),
          contentType: "text/plain",
        });
      }
      expect(unexpectedErrors, "unexpected browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
