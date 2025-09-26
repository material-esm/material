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
<div class="flex g12">
  <div style="width: 80px;">
    <md-rail active-index="1">
      <md-icon-button slot="menu" id="rail-menu-button">
        <md-icon>menu</md-icon>
      </md-icon-button>
      <md-fab slot="fab" variant="primary" href="/" lowered>
        <md-icon slot="icon">search</md-icon>
      </md-fab>

      <md-navigation-tab label="Home">
        <md-icon slot="active-icon">home</md-icon>
        <md-icon slot="inactive-icon">home</md-icon>
      </md-navigation-tab>
      <md-navigation-tab label="Stuff" href="/">
        <md-icon slot="active-icon">home</md-icon>
        <md-icon slot="inactive-icon">home</md-icon>
      </md-navigation-tab>
      <md-navigation-tab label="Cart" badge-value="3" show-badge>
        <md-icon slot="active-icon">shopping_cart</md-icon>
        <md-icon slot="inactive-icon">shopping_cart</md-icon>
        <md-badge value="3"></md-badge>
      </md-navigation-tab>
    </md-rail>
  </div>
  <div>MAIN CONTENT</div>
</div>
```
