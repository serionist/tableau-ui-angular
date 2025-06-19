import { FormArrayPipe } from './form-array.pipe';

describe('FormArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new FormArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
