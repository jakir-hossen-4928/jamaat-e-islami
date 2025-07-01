import { test, expect } from '@playwright/test';

test('Super Admin full navigation and voter flow', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('http://localhost:5173/login');

  // 2. Log in as a super admin (replace with real credentials)
  await page.fill('input[type="email"]', 'mdjakirkhan4928@gmail.com');
  await page.fill('input[type="password"]', 'mdjakirkhan4928@gmail.com');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 3. Define all sidebar navigation links for super admin
  const navLinks = [
    { path: '/dashboard', label: 'ড্যাশবোর্ড' },
    { path: '/admin/all-voters', label: 'সকল ভোটার' },
    { path: '/admin/add-new-voter', label: 'নতুন ভোটার যোগ করুন' },
    { path: '/admin/google-forms', label: 'গুগল ফর্ম' },
    { path: '/admin/analytics-reports', label: 'বিশ্লেষণ রিপোর্ট' },
    { path: '/admin/sms-campaigns', label: 'SMS ক্যাম্পেইন' },
    { path: '/admin/data-management', label: 'ডেটা ব্যবস্থাপনা' },
    { path: '/admin/location-management', label: 'এলাকা ব্যবস্থাপনা' },
    { path: '/admin/system-configuration', label: 'সিস্টেম কনফিগারেশন' },
    { path: '/admin/user-verification', label: 'ব্যবহারকারী যাচাইকরণ' },
  ];

  // 4. Visit each navigation link and check for key UI elements
  for (const link of navLinks) {
    await page.click(`a[href="${link.path}"]`);
    await page.waitForURL(`**${link.path}`);
    await expect(page.locator(`text=${link.label}`)).toBeVisible();
  }

  // 5. Add a voter
  await page.click('a[href="/admin/add-new-voter"]');
  await page.waitForURL('**/admin/add-new-voter');
  const voterName = 'Test Voter Playwright';
  await page.fill('#voterName', voterName);
  await page.click('button[type="submit"]');
  await expect(page.locator('text=ভোটার সফলভাবে যোগ হয়েছে!')).toBeVisible();
  await expect(page.locator(`text=${voterName} ভোটার ডাটাবেজে যোগ করা হয়েছে।`)).toBeVisible();

  // 6. Check voter appears in All Voters
  await page.click('a[href="/admin/all-voters"]');
  await page.waitForURL('**/admin/all-voters');
  await expect(page.locator(`text=${voterName}`)).toBeVisible();

  // 7. Check analytics page loads and updates
  await page.click('a[href="/admin/analytics-reports"]');
  await page.waitForURL('**/admin/analytics-reports');
  await expect(page.locator('text=বিশ্লেষণ রিপোর্ট')).toBeVisible();
  // Optionally, check for updated stats if possible

  // 8. Visit all other admin pages to ensure they load
  for (const link of navLinks) {
    await page.click(`a[href="${link.path}"]`);
    await page.waitForURL(`**${link.path}`);
    await expect(page.locator(`text=${link.label}`)).toBeVisible();
  }
});