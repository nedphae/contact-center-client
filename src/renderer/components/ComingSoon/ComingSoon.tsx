import React from 'react';

import { CssBaseline, Container } from '@material-ui/core';
import comingSoon from 'renderer/assets/img/Coming-Soon.webp';

export default function ComingSoon() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <img src={comingSoon} alt="coming soon" style={{ width: '100%' }} />
      </Container>
    </>
  );
}
