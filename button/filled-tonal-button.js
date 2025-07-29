/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { styles as tonalStyles } from './internal/filled-tonal-styles.js'
import { styles as sharedElevationStyles } from './internal/shared-elevation-styles.js'
import { styles as sharedStyles } from './internal/shared-styles.js'
import '../elevation/elevation.js'
import { html } from 'lit'
import { Button } from './internal/button.js'

/**
 * @summary Buttons help people take action, such as sending an email, sharing a
 * document, or liking a comment.
 *
 * @description
 * __Emphasis:__ Medium emphasis – For important actions that don’t distract
 * from other onscreen elements.
 *
 * __Rationale:__ Filled tonal buttons have a lighter background color and
 * darker label color, making them less visually prominent than a regular,
 * filled button. They’re still used for final or unblocking actions in a flow,
 * but do so with less emphasis.
 *
 * __Example usages:__
 * - Save
 * - Confirm
 * - Done
 *
 * @final
 * @suppress {visibility}
 */
export class FilledTonalButton extends Button {
    renderElevationOrOutline() {
        return html`<md-elevation part="elevation"></md-elevation>`
    }
}

FilledTonalButton.styles = [
    sharedStyles,
    sharedElevationStyles,
    tonalStyles,
]

customElements.define('md-filled-tonal-button', FilledTonalButton)
