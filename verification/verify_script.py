from playwright.sync_api import sync_playwright

def verify_date_picker():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/demo/date-picker-test.html")

            # Wait for component
            page.wait_for_selector("md-text-field")
            page.wait_for_timeout(2000)

            # Check if trailing icon exists (inside shadow dom)
            # The icon button should be there.
            # md-text-field -> shadow -> .icon.trailing -> md-icon-button

            # Using evaluate to access shadow DOM
            has_icon = page.evaluate("""() => {
                const field = document.querySelector('md-text-field');
                const button = field.shadowRoot.querySelector('md-icon-button');
                return !!button;
            }""")
            print(f"Has trailing icon button: {has_icon}")

            # Take screenshot before click
            page.screenshot(path="verification/before_click.png")

            # Click the icon button
            page.evaluate("""() => {
                const field = document.querySelector('md-text-field');
                const button = field.shadowRoot.querySelector('md-icon-button');
                button.click();
            }""")

            # Check if dialog is open
            page.wait_for_timeout(500)
            is_open = page.evaluate("""() => {
                const dialog = document.querySelector('md-date-picker-dialog');
                return dialog.open;
            }""")
            print(f"Dialog open after click: {is_open}")

            page.screenshot(path="verification/after_click.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_date_picker()
