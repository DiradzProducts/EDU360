# EDU360 Multi-Palette Color System & Visual Architecture

EDU360 features **6 curated, accessible institutional design layouts** designed for school leadership, faculty, and student portals. Users can live-switch between all 6 palettes using the top navigation bar dropdown.

Every palette strictly respects WCAG AA/AAA guidelines with high-contrast text (>7:1 to >14:1) in both Light and Dark modes.

---

### The 6 Curated Palettes

| Palette | Aesthetic Vibe | Light Mode (`:root`) | Dark Mode (`.dark`) | Highlights & Accents |
| :--- | :--- | :--- | :--- | :--- |
| **🟢 Forest & Lime** (`lime`) | Futuristic Fintech / Career Upskilling | Canvas: `#F4FBF7`<br/>Cards: `#FFFFFF`<br/>Text: `#022C22` | Canvas: `#042F2E`<br/>Cards: `#0D4844`<br/>Text: `#F0FDF4` | **Tech Lime (`#84CC16` / `#A3E635`)** buttons & active pills, Sky Cyan (`#38BDF8`) badges. |
| **🔵 Cobalt Indigo** (`cobalt`) | Stripe / Linear High-Trust SaaS | Canvas: `#F8FAFC`<br/>Cards: `#FFFFFF`<br/>Text: `#0F172A` | Canvas: `#0B0F19`<br/>Cards: `#1E293B`<br/>Text: `#F8FAFC` | **Cobalt Royal Blue (`#2563EB` / `#3B82F6`)**, Sophisticated Teal (`#0D9488`), Warm Coral (`#F97316`). |
| **🟣 Iris Violet** (`violet`) | Modern AI & Cognitive Intelligence | Canvas: `#FAF8FF`<br/>Cards: `#FFFFFF`<br/>Text: `#1E1235` | Canvas: `#0D071E`<br/>Cards: `#1A1033`<br/>Text: `#F5F3FF` | **Royal Violet / Iris (`#7C3AED` / `#8B5CF6`)**, Magenta (`#EC4899`), Lavender borders. |
| **🟠 Amber Gold** (`amber`) | Prestige Academy & Executive Command | Canvas: `#FDFBF7`<br/>Cards: `#FFFFFF`<br/>Text: `#291C0E` | Canvas: `#120F0C`<br/>Cards: `#1E1914`<br/>Text: `#FFFBEB` | **Rich Amber Gold (`#D97706` / `#F59E0B`)**, Emerald (`#059669`), Warm Bronze accents. |
| **🌊 Nordic Ocean** (`ocean`) | Glacier Cyan & Deep Maritime Tech | Canvas: `#F0F9FF`<br/>Cards: `#FFFFFF`<br/>Text: `#082F49` | Canvas: `#031525`<br/>Cards: `#0A2742`<br/>Text: `#F0F9FF` | **Electric Cyan Ocean (`#0284C7` / `#38BDF8`)**, Seafoam Mint (`#10B981`). |
| **🍷 Heritage Crimson** (`crimson`) | Oxford & Harvard Ivy League Classic | Canvas: `#FFF8F8`<br/>Cards: `#FFFFFF`<br/>Text: `#330C16` | Canvas: `#16060B`<br/>Cards: `#270D16`<br/>Text: `#FFF1F2` | **Ruby Crimson (`#BE123C` / `#E11D48`)**, Antique Gold (`#D97706`). |

---

### How It Works

1. **Live Switching**:
   - The user clicks the **Theme Layout** pill in the top navbar to open the dropdown menu.
   - Selecting any palette instantly updates the application via `document.documentElement.setAttribute('data-palette', palette)`.
2. **Instant Persistence**:
   - Saved in `localStorage['edu360-palette']` so user preference persists across sessions and pages.
3. **Contrast Invariant Guarantee**:
   - **Light Mode**: All palettes enforce deep ink text (`#022C22`, `#0F172A`, `#1E1235`, etc.) on white/off-white cards. No washed-out or white-on-white text ever.
   - **Dark Mode**: All palettes enforce high-luminance text (`#F0FDF4`, `#F8FAFC`, `#F5F3FF`, etc.) on rich, tinted dark cards.
