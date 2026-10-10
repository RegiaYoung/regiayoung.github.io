const { test, expect } = require("@playwright/test");

test("homepage exposes native posts, contact links, and the preserved feed", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator(".about > article > h2")).toHaveText(["Selected publications", "What's new", "Latest posts"]);
  await expect(page.getByRole("heading", { name: "Latest posts" })).toBeVisible();
  await expect(page.locator(".clearfix a[href='mailto:ryang379@connect.hkust-gz.edu.cn']")).toBeVisible();
  await expect(page.locator(".clearfix a[href='https://github.com/RegiaYoung']")).toBeVisible();
  const rss = page.locator(".social a[title='Subscribe to the blog via RSS']");
  await expect(rss).toHaveAttribute("href", "/index.xml");
  const feed = await request.get(await rss.getAttribute("href"));
  expect(feed.ok()).toBe(true);
  expect(await feed.text()).toContain("http://www.w3.org/2005/Atom");
});

test("Repo leads with the native profile and keeps direct links when stats cards fail", async ({ page }) => {
  await page.route("https://github-stats-extended.vercel.app/**", (route) => route.abort());
  await page.goto("/repo/");
  await expect(page.locator("article h2")).toHaveText(["GitHub profile", "GitHub Repositories"]);
  const profileCards = page.locator(".repo img[alt='RegiaYoung']");
  await expect(profileCards).toHaveCount(2);
  const themes = [];
  for (const src of await profileCards.evaluateAll((images) => images.map((image) => image.src))) {
    const params = new URL(src).searchParams;
    expect(params.get("username")).toBe("RegiaYoung");
    expect(params.has("custom_title")).toBe(false);
    themes.push(params.get("theme"));
  }
  expect(themes).toEqual(["default", "dark"]);
  await expect(page.getByRole("link", { name: "View all repositories on GitHub" })).toBeVisible();
  for (const name of ["SlideFormer", "SlideDP"]) {
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", `https://github.com/RegiaYoung/${name}`);
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  }
});

test("venue text stays legible and native CV lists stay aligned in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/publications/");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => localStorage.setItem("theme", value), theme);
    await page.goto("/publications/");
    const contrast = await page.locator(".publications .abbr abbr").evaluateAll((badges) => {
      const luminance = (color) => {
        const rgb = color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number);
        const linear = rgb.map((value) => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };
      return badges.map((badge) => {
        const foreground = luminance(getComputedStyle(badge.firstElementChild || badge).color);
        const background = luminance(getComputedStyle(badge).backgroundColor);
        return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
      });
    });
    expect(contrast).toHaveLength(3);
    for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);

    await page.goto("/cv/");
    const entries = page.locator(".cv .list-group > .list-group-item");
    expect(await entries.count()).toBeGreaterThan(0);
    expect(await entries.evaluateAll((items) => items.every((item) => getComputedStyle(item).display !== "list-item"))).toBe(true);
    const education = page.locator("#education + .card .list-group-item").first();
    const date = await education.locator(".badge").boundingBox();
    const title = await education.locator(".title").boundingBox();
    expect(Math.abs(date.y + date.height / 2 - (title.y + title.height / 2))).toBeLessThan(12);
    const advisor = education.locator(".items > li").first();
    await expect(advisor).toContainText("Advisor: Prof. Zeyi Wen");
    expect(await advisor.evaluate((item) => getComputedStyle(item).listStyleType)).not.toBe("none");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
  }
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

test("CV reuses bibliography data and renders confirmed education, awards, and teaching", async ({ page }) => {
  await page.goto("/publications/");
  const titles = (await page.locator(".bibliography .title").allTextContents()).map((title) => title.trim());
  await page.goto("/cv/");
  const publications = page.locator("#publications + .card");
  await expect(publications.locator(".title")).toHaveText(titles);
  const slidedp = publications.locator("li").filter({ hasText: "SlideDP:" });
  await expect(slidedp).toContainText("Ruijia Yang, Shiyuan Lin, Yulong Ao, Zhiyu Li, Yingli Zhao, Xianduo Li, Yonghua Lin, Zeyi Wen.");
  await expect(slidedp.getByRole("link", { name: "PDF", exact: true })).toHaveAttribute("href", "https://arxiv.org/pdf/2609.34162");
  await expect(slidedp.getByRole("link", { name: "Code", exact: true })).toHaveAttribute("href", "https://github.com/RegiaYoung/SlideDP");
  await expect(page.locator("#education + .card")).toContainText("Bachelor of Engineering");
  const awards = page.locator("#honors-and-awards + .card");
  await expect(awards).toContainText("Advisor to the HKUST(GZ) team.");
  await expect(awards).toContainText("4th Place. Team Leader.");
  await expect(awards).toContainText("10th ASC Student Supercomputer Challenge (22-23)");
  await expect(awards).toContainText("2020–2023");
  await expect(awards).toContainText("SYSU Outstanding Student Scholarship");
  await expect(page.locator("#teaching + .card")).toContainText("DSAA 5003: Automatic Machine Learning.");
  await expect(page.locator("#teaching + .card")).toContainText("Fall 2025");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
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
  await expect(page.locator("#education + .card")).toContainText("Sun Yat-sen University");
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
