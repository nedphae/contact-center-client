import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { history, configuredStore } from '../store';
import HomePage from '../HomePage';

const store = configuredStore();

describe('HomePage', () => {
  it('should render', () => {
    expect(render(<HomePage store={store} history={history} />)).toBeTruthy();
  });
});
