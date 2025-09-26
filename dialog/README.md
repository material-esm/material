# Dialog

## Usage

First, create the dialog. This will be hidden by default, unless you specify the `open` attribute on the `md-dialog` tag.

```html
<md-dialog id="confirm-remove">
  <div slot="headline">
      Delete item
  </div>
  <div slot="content">
      Are you sure you want to delete this item?
  </div>
  <div slot="actions">
    <md-button color="text" @click=${() => this.renderRoot.querySelector("#confirm-remove").close()}>Cancel</md-button>
    <md-button color="text" @click=${this.deleteConfirmed}>Ok</md-button>
  </div>
</md-dialog>

<md-button color="filled" @click=${this.openDialog}>Delete</md-button>
```

Then if someone click the button above, it will call this:

```js
openDialog() {
  this.renderRoot.querySelector("#confirm-remove").show()
}
```

If you need to call your API or do some action based on what the user chooses, you'd do something like this:

```js
deleteConfirmed() {
  // Call your API to delete the item here

  this.renderRoot.querySelector("#confirm-remove").close()
}
```
