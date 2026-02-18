import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("redirects to login page", async ({ page }) => {
    await expect(page).toHaveURL("http://localhost:3000/login");
    await expect(page.locator("h2")).toContainText("Legal Lending Platform");
  });

  test("shows login form with demo credentials", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator("text=Demo credentials:")).toBeVisible();
    await expect(page.locator("text=lender@lawfirm.com")).toBeVisible();
    await expect(page.locator("text=borrower@lawfirm.com")).toBeVisible();
  });

  test("borrower can login and sees dashboard", async ({ page }) => {
    await page.fill('input[type="email"]', "borrower@lawfirm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");
    await expect(page.locator("h2")).toContainText("Welcome back, Bob Borrower");
    await expect(page.locator("text=BORROWER_ADMIN")).toBeVisible();
    await expect(page.locator("text=Smith & Associates")).toBeVisible();

    // Check borrower-specific links
    await expect(page.locator("text=New Loan Application")).toBeVisible();
    await expect(page.locator("text=My Applications")).toBeVisible();
    await expect(page.locator("text=My Loans")).toBeVisible();

    // Should NOT see lender links
    await expect(page.locator("text=Review Applications")).not.toBeVisible();
    await expect(page.locator("text=Active Loans")).not.toBeVisible();
  });

  test("lender can login and sees dashboard", async ({ page }) => {
    await page.fill('input[type="email"]', "lender@lawfirm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");
    await expect(page.locator("h2")).toContainText("Welcome back, John Lender");
    await expect(page.locator("text=LENDER_ADMIN")).toBeVisible();
    await expect(page.locator("text=Capital Legal Funding")).toBeVisible();

    // Check lender-specific links
    await expect(page.locator("text=Review Applications")).toBeVisible();
    await expect(page.locator("text=Active Loans")).toBeVisible();

    // Should NOT see borrower links
    await expect(page.locator("text=New Loan Application")).not.toBeVisible();
    await expect(page.locator("text=My Applications")).not.toBeVisible();
    await expect(page.locator("text=My Loans")).not.toBeVisible();
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("can sign out", async ({ page }) => {
    await page.fill('input[type="email"]', "borrower@lawfirm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");

    await page.click('button:has-text("Sign out")');
    await page.waitForURL("**/login");

    await expect(page.locator("h2")).toContainText("Legal Lending Platform");
  });
});
