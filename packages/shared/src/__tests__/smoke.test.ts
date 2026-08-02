// shared/src/__tests__/smoke.test.ts
import * as shared from '../index';

describe('shared package', () => {
  it('exports modules', () => {
    expect(shared).toBeDefined();
  });
});
