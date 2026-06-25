import { css, unsafeCSS } from 'lit'

/**
 * Material Design 3 Typography System Tokens.
 * These map CSS custom properties to their M3 baseline defaults.
 */
export const typescaleTokens = {
  // Brand Typeface Reference
  '--md-ref-typeface-brand': 'Roboto',
  '--md-ref-typeface-plain': 'Roboto',
  '--md-ref-typeface-weight-regular': '400',
  '--md-ref-typeface-weight-medium': '500',
  '--md-ref-typeface-weight-bold': '700',

  // Display Large
  '--md-sys-typescale-display-large-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-display-large-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-display-large-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-display-large-size': '3.5625rem', // 57px
  '--md-sys-typescale-display-large-line-height': '4rem', // 64px
  '--md-sys-typescale-display-large-tracking': '-0.015625rem', // -0.25px

  // Display Medium
  '--md-sys-typescale-display-medium-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-display-medium-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-display-medium-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-display-medium-size': '2.8125rem', // 45px
  '--md-sys-typescale-display-medium-line-height': '3.25rem', // 52px
  '--md-sys-typescale-display-medium-tracking': '0rem',

  // Display Small
  '--md-sys-typescale-display-small-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-display-small-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-display-small-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-display-small-size': '2.25rem', // 36px
  '--md-sys-typescale-display-small-line-height': '2.75rem', // 44px
  '--md-sys-typescale-display-small-tracking': '0rem',

  // Headline Large
  '--md-sys-typescale-headline-large-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-headline-large-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-headline-large-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-headline-large-size': '2rem', // 32px
  '--md-sys-typescale-headline-large-line-height': '2.5rem', // 40px
  '--md-sys-typescale-headline-large-tracking': '0rem',

  // Headline Medium
  '--md-sys-typescale-headline-medium-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-headline-medium-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-headline-medium-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-headline-medium-size': '1.75rem', // 28px
  '--md-sys-typescale-headline-medium-line-height': '2.25rem', // 36px
  '--md-sys-typescale-headline-medium-tracking': '0rem',

  // Headline Small
  '--md-sys-typescale-headline-small-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-headline-small-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-headline-small-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-headline-small-size': '1.5rem', // 24px
  '--md-sys-typescale-headline-small-line-height': '2rem', // 32px
  '--md-sys-typescale-headline-small-tracking': '0rem',

  // Title Large
  '--md-sys-typescale-title-large-font': 'var(--md-ref-typeface-brand, Roboto)',
  '--md-sys-typescale-title-large-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-title-large-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-title-large-size': '1.375rem', // 22px
  '--md-sys-typescale-title-large-line-height': '1.75rem', // 28px
  '--md-sys-typescale-title-large-tracking': '0rem',

  // Title Medium
  '--md-sys-typescale-title-medium-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-title-medium-weight': 'var(--md-ref-typeface-weight-medium, 500)',
  '--md-sys-typescale-title-medium-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-title-medium-size': '1rem', // 16px
  '--md-sys-typescale-title-medium-line-height': '1.5rem', // 24px
  '--md-sys-typescale-title-medium-tracking': '0.009375rem', // 0.15px

  // Title Small
  '--md-sys-typescale-title-small-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-title-small-weight': 'var(--md-ref-typeface-weight-medium, 500)',
  '--md-sys-typescale-title-small-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-title-small-size': '0.875rem', // 14px
  '--md-sys-typescale-title-small-line-height': '1.25rem', // 20px
  '--md-sys-typescale-title-small-tracking': '0.00625rem', // 0.1px

  // Body Large
  '--md-sys-typescale-body-large-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-body-large-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-body-large-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-body-large-size': '1rem', // 16px
  '--md-sys-typescale-body-large-line-height': '1.5rem', // 24px
  '--md-sys-typescale-body-large-tracking': '0.03125rem', // 0.5px

  // Body Medium
  '--md-sys-typescale-body-medium-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-body-medium-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-body-medium-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-body-medium-size': '0.875rem', // 14px
  '--md-sys-typescale-body-medium-line-height': '1.25rem', // 20px
  '--md-sys-typescale-body-medium-tracking': '0.015625rem', // 0.25px

  // Body Small
  '--md-sys-typescale-body-small-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-body-small-weight': 'var(--md-ref-typeface-weight-regular, 400)',
  '--md-sys-typescale-body-small-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-body-small-size': '0.75rem', // 12px
  '--md-sys-typescale-body-small-line-height': '1rem', // 16px
  '--md-sys-typescale-body-small-tracking': '0.025rem', // 0.4px

  // Label Large
  '--md-sys-typescale-label-large-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-label-large-weight': 'var(--md-ref-typeface-weight-medium, 500)',
  '--md-sys-typescale-label-large-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-label-large-size': '0.875rem', // 14px
  '--md-sys-typescale-label-large-line-height': '1.25rem', // 20px
  '--md-sys-typescale-label-large-tracking': '0.00625rem', // 0.1px

  // Label Medium
  '--md-sys-typescale-label-medium-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-label-medium-weight': 'var(--md-ref-typeface-weight-medium, 500)',
  '--md-sys-typescale-label-medium-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-label-medium-size': '0.75rem', // 12px
  '--md-sys-typescale-label-medium-line-height': '1rem', // 16px
  '--md-sys-typescale-label-medium-tracking': '0.03125rem', // 0.5px

  // Label Small
  '--md-sys-typescale-label-small-font': 'var(--md-ref-typeface-plain, Roboto)',
  '--md-sys-typescale-label-small-weight': 'var(--md-ref-typeface-weight-medium, 500)',
  '--md-sys-typescale-label-small-weight-prominent': 'var(--md-ref-typeface-weight-bold, 700)',
  '--md-sys-typescale-label-small-size': '0.6875rem', // 11px
  '--md-sys-typescale-label-small-line-height': '1rem', // 16px
  '--md-sys-typescale-label-small-tracking': '0.03125rem', // 0.5px
}

/**
 * Converts typescaleTokens object to raw CSS rules for custom properties.
 */
export const cssVariablesString = Object.entries(typescaleTokens)
  .map(([prop, val]) => `  ${prop}: ${val};`)
  .join('\n')

/**
 * Raw vanilla CSS string for class rules.
 */
export const classesCssString = `
@layer {
  /* Display Styles */
  .md-typescale-display-large {
    font: var(--md-sys-typescale-display-large-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-display-large-size, 3.5625rem) / var(--md-sys-typescale-display-large-line-height, 4rem)
      var(--md-sys-typescale-display-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-large-tracking, -0.015625rem);
  }
  .md-typescale-display-large-prominent {
    font: var(--md-sys-typescale-display-large-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-display-large-size, 3.5625rem) / var(--md-sys-typescale-display-large-line-height, 4rem)
      var(--md-sys-typescale-display-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-large-tracking, -0.015625rem);
  }

  .md-typescale-display-medium {
    font: var(--md-sys-typescale-display-medium-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-display-medium-size, 2.8125rem) / var(--md-sys-typescale-display-medium-line-height, 3.25rem)
      var(--md-sys-typescale-display-medium-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-medium-tracking, 0rem);
  }
  .md-typescale-display-medium-prominent {
    font: var(--md-sys-typescale-display-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-display-medium-size, 2.8125rem) / var(--md-sys-typescale-display-medium-line-height, 3.25rem)
      var(--md-sys-typescale-display-medium-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-medium-tracking, 0rem);
  }

  .md-typescale-display-small {
    font: var(--md-sys-typescale-display-small-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-display-small-size, 2.25rem) / var(--md-sys-typescale-display-small-line-height, 2.75rem)
      var(--md-sys-typescale-display-small-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-small-tracking, 0rem);
  }
  .md-typescale-display-small-prominent {
    font: var(--md-sys-typescale-display-small-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-display-small-size, 2.25rem) / var(--md-sys-typescale-display-small-line-height, 2.75rem)
      var(--md-sys-typescale-display-small-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-display-small-tracking, 0rem);
  }

  /* Headline Styles */
  .md-typescale-headline-large {
    font: var(--md-sys-typescale-headline-large-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-headline-large-size, 2rem) / var(--md-sys-typescale-headline-large-line-height, 2.5rem)
      var(--md-sys-typescale-headline-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-large-tracking, 0rem);
  }
  .md-typescale-headline-large-prominent {
    font: var(--md-sys-typescale-headline-large-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-headline-large-size, 2rem) / var(--md-sys-typescale-headline-large-line-height, 2.5rem)
      var(--md-sys-typescale-headline-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-large-tracking, 0rem);
  }

  .md-typescale-headline-medium {
    font: var(--md-sys-typescale-headline-medium-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-headline-medium-size, 1.75rem) / var(--md-sys-typescale-headline-medium-line-height, 2.25rem)
      var(--md-sys-typescale-headline-medium-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-medium-tracking, 0rem);
  }
  .md-typescale-headline-medium-prominent {
    font: var(--md-sys-typescale-headline-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-headline-medium-size, 1.75rem) / var(--md-sys-typescale-headline-medium-line-height, 2.25rem)
      var(--md-sys-typescale-headline-medium-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-medium-tracking, 0rem);
  }

  .md-typescale-headline-small {
    font: var(--md-sys-typescale-headline-small-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-headline-small-size, 1.5rem) / var(--md-sys-typescale-headline-small-line-height, 2rem)
      var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-small-tracking, 0rem);
  }
  .md-typescale-headline-small-prominent {
    font: var(--md-sys-typescale-headline-small-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-headline-small-size, 1.5rem) / var(--md-sys-typescale-headline-small-line-height, 2rem)
      var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-headline-small-tracking, 0rem);
  }

  /* Title Styles */
  .md-typescale-title-large {
    font: var(--md-sys-typescale-title-large-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-title-large-size, 1.375rem) / var(--md-sys-typescale-title-large-line-height, 1.75rem)
      var(--md-sys-typescale-title-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-title-large-tracking, 0rem);
  }
  .md-typescale-title-large-prominent {
    font: var(--md-sys-typescale-title-large-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-title-large-size, 1.375rem) / var(--md-sys-typescale-title-large-line-height, 1.75rem)
      var(--md-sys-typescale-title-large-font, var(--md-ref-typeface-brand, Roboto));
    letter-spacing: var(--md-sys-typescale-title-large-tracking, 0rem);
  }

  .md-typescale-title-medium {
    font: var(--md-sys-typescale-title-medium-weight, var(--md-ref-typeface-weight-medium, 500))
      var(--md-sys-typescale-title-medium-size, 1rem) / var(--md-sys-typescale-title-medium-line-height, 1.5rem)
      var(--md-sys-typescale-title-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-title-medium-tracking, 0.009375rem);
  }
  .md-typescale-title-medium-prominent {
    font: var(--md-sys-typescale-title-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-title-medium-size, 1rem) / var(--md-sys-typescale-title-medium-line-height, 1.5rem)
      var(--md-sys-typescale-title-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-title-medium-tracking, 0.009375rem);
  }

  .md-typescale-title-small {
    font: var(--md-sys-typescale-title-small-weight, var(--md-ref-typeface-weight-medium, 500))
      var(--md-sys-typescale-title-small-size, 0.875rem) / var(--md-sys-typescale-title-small-line-height, 1.25rem)
      var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-title-small-tracking, 0.00625rem);
  }
  .md-typescale-title-small-prominent {
    font: var(--md-sys-typescale-title-small-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-title-small-size, 0.875rem) / var(--md-sys-typescale-title-small-line-height, 1.25rem)
      var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-title-small-tracking, 0.00625rem);
  }

  /* Body Styles */
  .md-typescale-body-large {
    font: var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-body-large-size, 1rem) / var(--md-sys-typescale-body-large-line-height, 1.5rem)
      var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.03125rem);
  }
  .md-typescale-body-large-prominent {
    font: var(--md-sys-typescale-body-large-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-body-large-size, 1rem) / var(--md-sys-typescale-body-large-line-height, 1.5rem)
      var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.03125rem);
  }

  .md-typescale-body-medium {
    font: var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-body-medium-size, 0.875rem) / var(--md-sys-typescale-body-medium-line-height, 1.25rem)
      var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-medium-tracking, 0.015625rem);
  }
  .md-typescale-body-medium-prominent {
    font: var(--md-sys-typescale-body-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-body-medium-size, 0.875rem) / var(--md-sys-typescale-body-medium-line-height, 1.25rem)
      var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-medium-tracking, 0.015625rem);
  }

  .md-typescale-body-small {
    font: var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400))
      var(--md-sys-typescale-body-small-size, 0.75rem) / var(--md-sys-typescale-body-small-line-height, 1rem)
      var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-small-tracking, 0.025rem);
  }
  .md-typescale-body-small-prominent {
    font: var(--md-sys-typescale-body-small-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-body-small-size, 0.75rem) / var(--md-sys-typescale-body-small-line-height, 1rem)
      var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-body-small-tracking, 0.025rem);
  }

  /* Label Styles */
  .md-typescale-label-large {
    font: var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500))
      var(--md-sys-typescale-label-large-size, 0.875rem) / var(--md-sys-typescale-label-large-line-height, 1.25rem)
      var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-large-tracking, 0.00625rem);
  }
  .md-typescale-label-large-prominent {
    font: var(--md-sys-typescale-label-large-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-label-large-size, 0.875rem) / var(--md-sys-typescale-label-large-line-height, 1.25rem)
      var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-large-tracking, 0.00625rem);
  }

  .md-typescale-label-medium {
    font: var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500))
      var(--md-sys-typescale-label-medium-size, 0.75rem) / var(--md-sys-typescale-label-medium-line-height, 1rem)
      var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-medium-tracking, 0.03125rem);
  }
  .md-typescale-label-medium-prominent {
    font: var(--md-sys-typescale-label-medium-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-label-medium-size, 0.75rem) / var(--md-sys-typescale-label-medium-line-height, 1rem)
      var(--md-sys-typescale-label-medium-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-medium-tracking, 0.03125rem);
  }

  .md-typescale-label-small {
    font: var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500))
      var(--md-sys-typescale-label-small-size, 0.6875rem) / var(--md-sys-typescale-label-small-line-height, 1rem)
      var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-small-tracking, 0.03125rem);
  }
  .md-typescale-label-small-prominent {
    font: var(--md-sys-typescale-label-small-weight-prominent, var(--md-ref-typeface-weight-bold, 700))
      var(--md-sys-typescale-label-small-size, 0.6875rem) / var(--md-sys-typescale-label-small-line-height, 1rem)
      var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));
    letter-spacing: var(--md-sys-typescale-label-small-tracking, 0.03125rem);
  }
}
`

/**
 * Complete raw CSS stylesheet as a string, with variables defined on :root.
 */
export const typescaleCss = `
:root {
${cssVariablesString}
}
${classesCssString}
`

export const typescaleStyles = css`
  :host {
    --md-ref-typeface-brand: Roboto;
    --md-ref-typeface-plain: Roboto;
    --md-ref-typeface-weight-regular: 400;
    --md-ref-typeface-weight-medium: 500;
    --md-ref-typeface-weight-bold: 700;
  }
  ${unsafeCSS(classesCssString)}
`

// Default styles export matches Lit CSSResult structure
export const styles = typescaleStyles

/**
 * Helper to dynamically inject CSS styles into the document.
 * Useful for projects not using Lit.
 * @param {HTMLElement} target - Destination head or body element (defaults to document.head).
 */
export function injectTypescaleStyles(target = null) {
  if (typeof document === 'undefined') return
  const activeTarget = target || document.head
  const existing = document.getElementById('md-typescale-styles')
  if (existing) return

  const style = document.createElement('style')
  style.id = 'md-typescale-styles'
  style.textContent = typescaleCss
  activeTarget.appendChild(style)
}
