

# Add Support Page URL

## Summary
Create a dedicated Support page at `/support` so you have a proper **Support URL** (`https://budderbuddy.lovable.app/support`) for App Store submissions and marketing purposes.

---

## What Will Be Created

### New Support Page
A dedicated support screen matching the existing legal page styling (Privacy Policy, Terms of Service) that includes:

- **Header** with back navigation and "Support" title
- **Contact Methods**
  - Email support: support@budderbuddy.app (or your preferred email)
  - Links to Privacy Policy and Terms of Service
- **FAQ Section** covering common questions:
  - How to reset reminders
  - Photo sync issues
  - Account deletion requests
  - General app usage help
- **Response Time Expectations** (e.g., "We typically respond within 48 hours")

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/SupportScreen.tsx` | **Create** - New support page component |
| `src/App.tsx` | **Modify** - Add `/support` route |

---

## Final URLs

After implementation, your complete set of URLs will be:

| Purpose | URL |
|---------|-----|
| **Marketing** | `https://www.budderbuddy.app` |
| **Privacy Policy** | `https://budderbuddy.lovable.app/privacy` |
| **Terms of Service** | `https://budderbuddy.lovable.app/terms` |
| **Support** | `https://budderbuddy.lovable.app/support` |

---

## Technical Details

The Support page will:
- Follow the same design pattern as `PrivacyPolicyScreen.tsx` and `TermsOfServiceScreen.tsx`
- Use the liquid glass card styling for visual consistency
- Include `mailto:` links for easy email contact
- Be publicly accessible (no authentication required)

