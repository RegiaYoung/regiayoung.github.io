const { test, expect } = require("@playwright/test");

test("homepage exposes native posts, contact links, and the preserved feed", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "latest posts" })).toBeVisible();
  await expect(page.locator(".clearfix a[href='mailto:ryang379@connect.hkust-gz.edu.cn']")).toBeVisible();
  await expect(page.locator(".clearfix a[href='https://github.com/RegiaYoung']")).toBeVisible();
  const rss = page.locator(".social a[title='RSS']");
  await expect(rss).toHaveAttribute("href", "/index.xml");
  const feed = await request.get(await rss.getAttribute("href"));
  expect(feed.ok()).toBe(true);
  expect(await feed.text()).toContain("http://www.w3.org/2005/Atom");
});

test("publication filtering and native CV section navigation work", async ({ page }) => {
  await page.goto("/publications/");
  const entries = page.locator(".bibliography > li:visible");
  await expect(entries).toHaveCount(3);
  await page.getByPlaceholder("Type to filter").fill("SlideDP");
  await expect(entries).toHaveCount(1);
  await expect(entries).toContainText("SlideDP");
  await page.getByPlaceholder("Type to filter").fill("");
  await expect(entries).toHaveCount(3);
  await page.goto("/cv/");
  const teaching = page.locator("#toc-sidebar").getByRole("link", { name: "Teaching", exact: true });
  await expect(teaching).toBeVisible();
  await teaching.click();
  await expect(page).toHaveURL(/#teaching$/);
});

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
  const originalURL = page.url();
  await page.locator("article a[data-lightbox]").first().click();
  const preview = page.getByRole("dialog", { name: "Image preview" });
  await expect(preview).toBeVisible();
  const firstImage = await preview.locator("img").getAttribute("src");
  await preview.getByRole("button", { name: "Next image" }).click();
  await expect(preview.locator("img")).not.toHaveAttribute("src", firstImage);
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();
  await expect(page).toHaveURL(originalURL);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.locator("#progress").evaluate((element) => element.value)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
