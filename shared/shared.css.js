import { css } from 'lit'

export const sharedStyles = css`
  .flex {
    display: flex;
  }
  .col {
    flex-direction: column;
  }
  .row {
    flex-direction: row;
  }
  .aic {
    align-items: center;
  }
  .jcc {
    justify-content: center;
  }
  .fw {
    width: 100%;
  }

  .g8 {
    gap: 8px;
  }
  .g16 {
    gap: 16px;
  }
  .g24 {
    gap: 24px;
  }

  .pl4 {
    padding-left: 4px;
  }
  .pl8 {
    padding-left: 8px;
  }
  .pl16 {
    padding-left: 16px;
  }
  .pr4 {
    padding-right: 4px;
  }
  .pr8 {
    padding-right: 8px;
  }
  .pr16 {
    padding-right: 16px;
  }
`
