# Navigation Rail

This is a material 3 navigation rail. See demo for what it looks like.

Import:

```html
<script type="module">
  import 'material/navigationrail/navigation-rail.js'
  import 'material/navigationtab/navigation-tab.js'
</script>
```

Usage:

```html
<div class="gte-medium">
  <div class="flex g4" style="position: sticky; top: 0; overflow-y: auto; height: 100vh;">
    <div class="" id="nav-rail-container">
      <md-nav-rail active-index="1">
        <!-- <md-icon-button slot="menu" id="rail-menu-button">
              <md-icon>menu</md-icon>
            </md-icon-button> -->
        <md-fab slot="fab" variant="primary" lowered label="Search">
          <md-icon slot="icon">search</md-icon>
        </md-fab>

        <md-nav-item label="Home">
          <md-icon slot="active-icon">home</md-icon>
          <md-icon slot="inactive-icon">home</md-icon>
        </md-nav-item>
        <md-nav-item label="Organizations" href="/">
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
  </div>
</div>
```
