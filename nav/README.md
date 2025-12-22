# Navigation

## Navigation Rail

This is a material 3 navigation rail. See demo to see it in action.

Import:

```html
<script type="module">
  import 'material/nav/rail.js'
  import 'material/nav/item.js'
</script>
```

Usage:

```html
<div class="gte-medium">
  <div class="flex g4" style="position: sticky; top: 0; overflow-y: auto; height: 100vh;">
    <div class="" id="nav-rail-container">
      <md-nav-rail active-index="1">
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

## Bottom Navigation Bar

This is a material 3 bottom navigation bar. See demo to see it in action.

Import:

```html
<script type="module">
  import 'material/nav/bar.js'
  import 'material/nav/item.js'
</script>
```

Usage:

```html
<div class="lt-medium">
  <md-nav-bar active-index="1">
    <md-nav-item label="Home">
      <md-icon slot="active-icon">home</md-icon>
      <md-icon slot="inactive-icon">home</md-icon>
    </md-nav-item>
    <md-nav-item label="Stuff">
      <md-icon slot="active-icon">home</md-icon>
      <md-icon slot="inactive-icon">home</md-icon>
    </md-nav-item>
    <md-nav-item label="Cart" badge-value="3" show-badge>
      <md-icon slot="active-icon">shopping_cart</md-icon>
      <md-icon slot="inactive-icon">shopping_cart</md-icon>
      <md-badge value="3"></md-badge>
    </md-nav-item>
  </md-nav-bar>
</div>
```
