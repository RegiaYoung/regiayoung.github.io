const { test, expect } = require("@playwright/test");

test("blog archives and the old notes address reach the preserved article", async ({ page }) => {
  await page.goto("/notes/");
  await expect(page).toHaveURL(/\/blog\/$/);
  const title = "[教程] 硬刷BIOS！X370主板成功进化";
  await expect(page.locator(".post-list .post-title")).toHaveText(title);
  await expect(page.locator(".post-list img")).toBeVisible();
  for (const route of ["/blog/2021/", "/blog/tag/hardware/", "/blog/tag/bios/", "/blog/category/tutorials/"]) {
    await page.goto(route);
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page.locator("h1")).toContainText("X370");
  }
});

test("site search finds the original blog article", async ({ page }) => {
  await page.goto("/blog/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("textbox", { name: "Type to start searching" });
  await expect(input).toBeVisible();
  await input.fill("X370");
  await page.locator("ninja-keys").getByText("[教程] 硬刷BIOS！X370主板成功进化", { exact: true }).click();
  await expect(page.locator("h1")).toContainText("X370");
});

test("navigation, theme, and publication controls work", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Ruijia");
  const nav = page.locator("#navbarNav a.nav-link");
  await expect(nav).toHaveCount(5);
  for (const label of ["About", "Publications", "Repo", "Blog", "CV"]) {
    await expect(page.locator("#navbarNav").getByRole("link", { name: label, exact: false })).toBeVisible();
  }
  const before = await page.locator("html").getAttribute("data-theme-setting");
  await page.getByRole("button", { name: "Change color theme" }).click();
  await expect.poll(() => page.locator("html").getAttribute("data-theme-setting")).not.toBe(before);
  await page.goto("/publications/");
  await page.locator("a.bibtex").first().click();
  await expect(page.locator("div.bibtex").first()).toBeVisible();
  await page.goto("/cv/");
  await expect(page.getByText("Sun Yat-sen University", { exact: false })).toBeVisible();
  await expect(page.getByText("DSAA 2042: Computer Architecture and Systems", { exact: false })).toBeVisible();
});

test("mobile navigation and archived article remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.locator("#navbarNav").getByRole("link", { name: "Blog", exact: true }).click();
  await page.getByRole("link", { name: "[教程] 硬刷BIOS！X370主板成功进化", exact: true }).click();
  await expect(page.locator("h1")).toContainText("X370");
  await page.locator("article img").evaluateAll((images) => images.forEach((img) => (img.loading = "eager")));
  await expect
    .poll(() => page.locator("article img").evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)))
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
