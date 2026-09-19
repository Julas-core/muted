# Muted UI Registry

### Wallpaper card

File: `components/WallpaperCard.tsx`
Last updated: 2026-09-19

| Property | Pattern |
| --- | --- |
| Background | Image surface with a very light overlay |
| Border | None |
| Border radius | 18px |
| Text | Metadata represented by muted gray bars |
| Spacing | 10px inset metadata and 18px card gap |
| Active state | Heart uses the theme heart accent |
| Shadow | None |
| Accent usage | Red heart for a saved wallpaper |

**Pattern notes:**
Wallpaper cards use a restrained editorial treatment. Keep the card radius and metadata bars consistent across Home, Explore, and Profile.

### Floating tab bar

File: `components/FrostedTabBar.tsx`
Last updated: 2026-09-19

| Property | Pattern |
| --- | --- |
| Background | Translucent white surface over a blur |
| Border | Thin translucent border |
| Border radius | 34px |
| Text | 12px Sour Gummy labels |
| Spacing | 68px bar height, 21px from the bottom |
| Active state | Blue icon, label, and indicator dot |
| Shadow | Soft low opacity shadow |
| Accent usage | Theme primary blue |

**Pattern notes:**
The tab bar is a compact floating pill centered over the gradient. Keep it visually detached from screen content and reuse the same active indicator on every tab.

### Tab screen gradient

Files: `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/profile.tsx`
Last updated: 2026-09-19

| Property | Pattern |
| --- | --- |
| Background | Electric blue to pale blue linear gradient |
| Border | None |
| Border radius | None |
| Text | Dark ink on light surfaces, white on blue surfaces |
| Spacing | 30px page gutter for the wallpaper grid |
| Shadow | None on the page surface |
| Accent usage | Electric blue for active filters and profile actions |

**Pattern notes:**
Home starts blue and fades to pale blue. Explore starts pale and fades toward blue. Profile starts blue and fades toward pale blue. The wallpaper grid keeps a narrow two column rhythm with generous central space.
