import { css } from 'lit'

export const styles = css`
  .circle {
    border-radius: 50%;
  }
  .flex {
    display: flex;
  }
  .flexw {
    display: flex;
    flex-wrap: wrap;
  }
  .row {
    flex-direction: row;
  }
  .col {
    flex-direction: column;
  }

  .aic {
    align-items: center;
  }

  .jcc {
    justify-content: center;
  }
  .jcr {
    justify-content: right;
  }

  .fw {
    width: 100%;
  }

  .g8 {
    gap: 8px;
  }
  .g12 {
    gap: 12px;
  }
  .g24 {
    gap: 24px;
  }

  .p4 {
    padding: 4px;
  }
  .p12 {
    padding: 12px;
  }
  .p16 {
    padding: 16px;
  }

  .mt8 {
    margin-top: 8px;
  }
  .mt12 {
    margin-top: 12px;
  }
`
