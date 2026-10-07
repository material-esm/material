# Navigation

Material 3 navigation components for app-level navigation, implementing the [Material Design 3 Navigation Rail specification](https://m3.material.io/components/navigation-rail/specs) and [Bottom Navigation Bar specification](https://m3.material.io/components/navigation-bar/overview).

- **Navigation Rail (`md-nav-rail`)**: Vertical side navigation for medium and large screens, expandable from compact (96px) to wide drawer (220px–360px), and adaptable as a **modal rail / modal drawer** for compact screens or overlay navigation.
- **Navigation Item (`md-nav-item`)**: Navigation destinations within a rail or bar, with support for active/inactive icons, labels, badges, links, and expanded layouts.
- **Bottom Navigation Bar (`md-nav-bar`)**: Horizontal bottom bar for primary mobile navigation destinations.

## Import

```html
<script type="module">
  import 'material/nav/rail.js'
  import 'material/nav/item.js'
  import 'material/nav/bar.js'

  // Commonly paired components:
  import 'material/app/bar.js'
  import 'material/buttons/icon-button.js'
  import 'material/icon/icon.js'
  import 'material/buttons/fab.js'
  import 'material/badge/badge.js'
</script>
```

Or in JavaScript:

```js
import 'material/nav/rail.js'
import 'material/nav/item.js'
import 'material/nav/bar.js'
```

---

## Navigation Rail (`md-nav-rail`)

The navigation rail provides access to primary destinations in an app on tablets and desktops. It can operate in three modes:

1. **Standard Compact Rail**: Fixed 96px width with icon and label stacked vertically.
2. **Standard Expanded Rail**: Expanded width (220px–360px) showing icons alongside horizontal labels, toggled via the rail's menu button or programmatically.
3. **Modal Navigation Rail (Modal Drawer)**: Overlays page content on top of a backdrop scrim, typically used on compact/mobile screens or when opened on demand from a top app bar menu button.

### 1. Standard Navigation Rail

Place `md-nav-rail` in a persistent container next to your main content.

```html
<div class="layout-container" style="display: flex;">
  <div class="nav-rail-container" style="position: sticky; top: 0; height: 100vh; overflow-y: auto;">
    <md-nav-rail active-index="0">
      <!-- Optional Floating Action Button -->
      <md-fab slot="fab" variant="primary" lowered label="Search">
        <md-icon slot="icon">search</md-icon>
      </md-fab>

      <!-- Navigation Destinations -->
      <md-nav-item label="Home">
        <md-icon slot="active-icon">home</md-icon>
        <md-icon slot="inactive-icon">home</md-icon>
      </md-nav-item>
      <md-nav-item label="Organizations" href="/organizations">
        <md-icon slot="active-icon">groups</md-icon>
        <md-icon slot="inactive-icon">groups</md-icon>
      </md-nav-item>
      <md-nav-item label="Cart" badge-value="3" show-badge>
        <md-icon slot="active-icon">shopping_cart</md-icon>
        <md-icon slot="inactive-icon">shopping_cart</md-icon>
        <md-badge value="3"></md-badge>
      </md-nav-item>
    </md-nav-rail>
  </div>

  <main style="flex: 1; padding: 16px;">
    <!-- Content goes here -->
  </main>
</div>
```

#### Expanding and Collapsing

The rail has an `expanded` property (and reflected attribute). When expanded, items and FABs automatically shift from vertical stacked layouts to horizontal rows:

```html
<md-nav-rail expanded></md-nav-rail>
```

You can toggle it programmatically:

```js
const rail = document.querySelector('md-nav-rail')

// Toggle expanded state
rail.toggleExpanded()

// Or set directly
rail.expanded = true
```

The rail dispatches an `expanded-change` custom event whenever its expansion state changes:

```js
rail.addEventListener('expanded-change', (e) => {
  console.log('Expanded:', e.detail.expanded)
})
```

---

### 2. Modal Navigation Rail / Modal Drawer

On compact / mobile screens (e.g. width < 600px), Material 3 guidelines recommend displaying the navigation rail as a **modal drawer** that slides in over the page content with a backdrop scrim. It is typically opened by tapping the hamburger menu button in a top app bar (`<md-app-bar>`).

#### Complete Example: Opening from App Bar

##### HTML

```html
<div class="layout-container">
  <!-- Backdrop Scrim -->
  <div id="nav-scrim" class="nav-scrim" aria-hidden="true"></div>

  <!-- Modal Drawer / Rail Container -->
  <div id="nav-drawer-container" class="nav-drawer-container">
    <md-nav-rail id="nav-rail" active-index="0">
      <md-fab slot="fab" variant="primary" lowered label="Search">
        <md-icon slot="icon">search</md-icon>
      </md-fab>

      <md-nav-item label="Home">
        <md-icon slot="active-icon">home</md-icon>
        <md-icon slot="inactive-icon">home</md-icon>
      </md-nav-item>
      <md-nav-item label="Organizations" href="/organizations">
        <md-icon slot="active-icon">groups</md-icon>
        <md-icon slot="inactive-icon">groups</md-icon>
      </md-nav-item>
      <md-nav-item label="Cart" badge-value="3" show-badge>
        <md-icon slot="active-icon">shopping_cart</md-icon>
        <md-icon slot="inactive-icon">shopping_cart</md-icon>
        <md-badge value="3"></md-badge>
      </md-nav-item>
    </md-nav-rail>
  </div>

  <!-- Main Content Area with Top App Bar -->
  <div class="content-container">
    <md-app-bar id="appBar" headline="My Application">
      <md-icon-button slot="navigation-icon" id="top-nav-menu-button" aria-label="Open navigation menu">
        <md-icon>menu</md-icon>
      </md-icon-button>
    </md-app-bar>

    <main class="main-content">
      <h1>Welcome</h1>
      <p>Resize window under 600px to see the modal navigation rail in action.</p>
    </main>
  </div>
</div>
```

##### CSS

The drawer sits sticky on desktop, and transforms into a fixed off-screen slide-over panel on compact screens:

```css
/* Container layout */
.layout-container {
  display: flex;
  width: 100%;
  min-width: 0;
}

.content-container {
  flex: 1;
  min-width: 0;
}

/* Scrim is hidden on desktop */
.nav-scrim {
  display: none;
}

/* Desktop: sticky side navigation rail */
.nav-drawer-container {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;
}

/* Mobile & compact screens (< 600px): Modal Drawer */
@media (width < 600px) {
  .nav-scrim {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 250ms cubic-bezier(0.2, 0, 0, 1),
      visibility 250ms;
  }

  .nav-scrim.open {
    opacity: 1;
    visibility: visible;
  }

  .nav-drawer-container {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform 250ms cubic-bezier(0.2, 0, 0, 1),
      visibility 250ms;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    background-color: var(--md-sys-color-surface);
  }

  .nav-drawer-container.open {
    transform: translateX(0);
    visibility: visible;
  }
}
```

##### JavaScript

Connect the top app bar button to toggle the modal drawer on mobile (or toggle rail expansion on desktop), and handle closing interactions:

```js
const topNavMenuButton = document.getElementById('top-nav-menu-button')
const navRail = document.getElementById('nav-rail')
const navDrawerContainer = document.getElementById('nav-drawer-container')
const navScrim = document.getElementById('nav-scrim')

function isMobile() {
  return window.innerWidth < 600
}

function openModalDrawer() {
  if (navDrawerContainer && navScrim) {
    navDrawerContainer.classList.add('open')
    navScrim.classList.add('open')
    if (navRail) {
      // Ensure items show labels in modal drawer
      navRail.expanded = true
    }
  }
}

function closeModalDrawer() {
  if (navDrawerContainer && navScrim) {
    navDrawerContainer.classList.remove('open')
    navScrim.classList.remove('open')
  }
}

function toggleNav() {
  if (isMobile()) {
    const isOpen = navDrawerContainer?.classList.contains('open')
    if (isOpen) {
      closeModalDrawer()
    } else {
      openModalDrawer()
    }
  } else {
    navRail?.toggleExpanded()
  }
}

// 1. Open / toggle modal drawer from app bar menu button
topNavMenuButton?.addEventListener('click', toggleNav)

// 2. Close when tapping the backdrop scrim
navScrim?.addEventListener('click', closeModalDrawer)

// 3. Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navDrawerContainer?.classList.contains('open')) {
    closeModalDrawer()
  }
})

// 4. Close when a destination item is clicked on mobile
navRail?.addEventListener('click', (e) => {
  if (isMobile() && e.target.closest('md-nav-item')) {
    closeModalDrawer()
  }
})

// 5. Close if the rail's internal menu button collapses the rail on mobile
navRail?.addEventListener('expanded-change', (e) => {
  if (isMobile() && !e.detail.expanded) {
    closeModalDrawer()
  }
})
```

---

## Bottom Navigation Bar (`md-nav-bar`)

The bottom navigation bar displays three to five destinations at the bottom of a mobile screen.

```html
<md-nav-bar active-index="0">
  <md-nav-item label="Home">
    <md-icon slot="active-icon">home</md-icon>
    <md-icon slot="inactive-icon">home</md-icon>
  </md-nav-item>
  <md-nav-item label="Search">
    <md-icon slot="active-icon">search</md-icon>
    <md-icon slot="inactive-icon">search</md-icon>
  </md-nav-item>
  <md-nav-item label="Cart" badge-value="3" show-badge>
    <md-icon slot="active-icon">shopping_cart</md-icon>
    <md-icon slot="inactive-icon">shopping_cart</md-icon>
    <md-badge value="3"></md-badge>
  </md-nav-item>
</md-nav-bar>
```

---

## Navigation Item (`md-nav-item`)

Navigation items can be placed in either `md-nav-rail` or `md-nav-bar`. They represent individual destinations and support labels, active/inactive icons, badges, and link navigation:

```html
<!-- Regular tab destination -->
<md-nav-item label="Favorites">
  <md-icon slot="active-icon">favorite</md-icon>
  <md-icon slot="inactive-icon">favorite_border</md-icon>
</md-nav-item>

<!-- Link destination -->
<md-nav-item label="Profile" href="/profile">
  <md-icon slot="active-icon">person</md-icon>
  <md-icon slot="inactive-icon">person_outline</md-icon>
</md-nav-item>

<!-- Destination with badge -->
<md-nav-item label="Notifications" badge-value="9+" show-badge>
  <md-icon slot="active-icon">notifications</md-icon>
  <md-icon slot="inactive-icon">notifications_none</md-icon>
  <md-badge value="9+"></md-badge>
</md-nav-item>
```

---

## API Reference

### `md-nav-rail`

#### Properties and Attributes

| Property             | Attribute              | Type      | Default | Description                                                 |
| -------------------- | ---------------------- | --------- | ------- | ----------------------------------------------------------- |
| `activeIndex`        | `active-index`         | `number`  | `0`     | The 0-based index of the currently active navigation item.  |
| `expanded`           | `expanded`             | `boolean` | `false` | Whether the rail is expanded into the wide drawer layout.   |
| `hideInactiveLabels` | `hide-inactive-labels` | `boolean` | `false` | Whether to hide labels on destinations that are not active. |

#### Methods

| Method             | Parameters | Return | Description                                  |
| ------------------ | ---------- | ------ | -------------------------------------------- |
| `toggleExpanded()` | None       | `void` | Toggles the `expanded` property on the rail. |

#### Events

| Event                      | Detail                                         | Description                                                   |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| `expanded-change`          | `{ expanded: boolean }`                        | Dispatched whenever the `expanded` state changes.             |
| `navigation-bar-activated` | `{ tab: NavigationItem, activeIndex: number }` | Dispatched when an active navigation destination is selected. |

#### Slots

| Slot        | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| `menu`      | The top menu icon button. Defaults to `<md-icon-button>` toggling `expanded`.         |
| `fab`       | Optional floating action button (`<md-fab>`) positioned directly below the menu slot. |
| `(default)` | The list of destination items (`<md-nav-item>`).                                      |

---

### `md-nav-item`

#### Properties and Attributes

| Property            | Attribute             | Type      | Default | Description                                                     |
| ------------------- | --------------------- | --------- | ------- | --------------------------------------------------------------- |
| `label`             | `label`               | `string`  | `''`    | Text label displayed for the destination.                       |
| `active`            | `active`              | `boolean` | `false` | Whether this item is currently selected.                        |
| `href`              | `href`                | `string`  | `''`    | If provided, renders destination as an anchor link to navigate. |
| `badgeValue`        | `badge-value`         | `string`  | `''`    | Text/number value for the badge.                                |
| `showBadge`         | `show-badge`          | `boolean` | `false` | Whether to display the badge.                                   |
| `disabled`          | `disabled`            | `boolean` | `false` | Disables interaction with the item.                             |
| `expanded`          | `expanded`            | `boolean` | `false` | When true, renders label horizontally alongside icon.           |
| `hideInactiveLabel` | `hide-inactive-label` | `boolean` | `false` | Whether to hide this item's label when inactive.                |

#### Slots

| Slot            | Description                             |
| --------------- | --------------------------------------- |
| `active-icon`   | Icon displayed when item is active.     |
| `inactive-icon` | Icon displayed when item is inactive.   |
| `(default)`     | Additional content (e.g. `<md-badge>`). |

---

### `md-nav-bar`

#### Properties and Attributes

| Property             | Attribute              | Type      | Default | Description                                                |
| -------------------- | ---------------------- | --------- | ------- | ---------------------------------------------------------- |
| `activeIndex`        | `active-index`         | `number`  | `0`     | The 0-based index of the currently active navigation item. |
| `hideInactiveLabels` | `hide-inactive-labels` | `boolean` | `false` | Whether to hide labels on inactive navigation items.       |

#### Events

| Event                      | Detail                                         | Description                                                 |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `navigation-bar-activated` | `{ tab: NavigationItem, activeIndex: number }` | Dispatched when an active navigation destination is chosen. |

#### Slots

| Slot        | Description                                      |
| ----------- | ------------------------------------------------ |
| `(default)` | The list of destination items (`<md-nav-item>`). |
