import '@testing-library/jest-dom';

// Provide a Vitest-compatible global `vi` that proxies to Jest
// This allows tests written with `vi.mock`/`vi.fn` to run under Jest
const viCompat: any = {
  ...jest,
  fn: jest.fn.bind(jest),
  spyOn: jest.spyOn.bind(jest),
  mock: jest.mock.bind(jest),
  clearAllMocks: jest.clearAllMocks.bind(jest),
  resetAllMocks: jest.resetAllMocks.bind(jest),
  restoreAllMocks: jest.restoreAllMocks.bind(jest),
  useFakeTimers: jest.useFakeTimers.bind(jest),
  useRealTimers: jest.useRealTimers.bind(jest),
};

(globalThis as any).vi = viCompat;

// Mock next/image to a plain img element for predictable testing
jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ src, alt, ...rest }: any) => React.createElement('img', { src, alt, ...rest }),
  };
});
