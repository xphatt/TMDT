import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const storefrontSource = await readFile(new URL("../app/components/TeaShop.tsx", import.meta.url), "utf8");
const storefrontCss = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const adminShellSource = await readFile(new URL("../app/admin/components/AdminShell.tsx", import.meta.url), "utf8");
const adminCss = await readFile(new URL("../app/admin/admin.css", import.meta.url), "utf8");

test("keyboard focus remains visible and checkout errors receive focus after render", () => {
  assert.match(
    storefrontCss,
    /\.choice-grid label:has\(input:focus-visible\)/,
    "The visible choice tile must expose keyboard focus when its visually hidden radio is focused.",
  );
  assert.match(
    storefrontSource,
    /window\.setTimeout\(\(\) => document\.getElementById\("checkout-errors"\)\?\.focus\(\), 0\)/,
    "Checkout validation must wait for the error summary to render before moving focus.",
  );
  assert.match(
    storefrontSource,
    /const sortedToppings = \[\.\.\.selectedToppings\]\.sort\(\)/,
    "Cart key normalization must sort a copy instead of mutating React state.",
  );
});

test("the closed admin drawer is not focusable and mobile navigation targets stay tappable", () => {
  assert.match(
    adminShellSource,
    /id="admin-navigation"/,
    "aria-controls on the mobile menu button must reference the admin drawer.",
  );
  assert.match(
    adminCss,
    /\.admin-sidebar \{[^}]*visibility: hidden;[^}]*pointer-events: none;/s,
    "The off-canvas admin drawer must leave the accessibility and pointer trees while closed.",
  );
  assert.match(
    adminCss,
    /\.admin-sidebar\.is-open \{[^}]*visibility: visible;[^}]*pointer-events: auto;/s,
    "Opening the admin drawer must restore visibility and pointer interaction.",
  );
  assert.match(
    adminCss,
    /\.admin-mobile-brand \{[^}]*min-height: 44px;/s,
    "The mobile admin brand link must provide a 44px touch target.",
  );
  assert.match(
    adminCss,
    /\.admin-back-link \{[^}]*min-height: 44px;/s,
    "The admin back link must provide a 44px touch target.",
  );
});
