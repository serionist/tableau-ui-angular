import { FormArrayValuePipe } from './form-array-value.pipe';

describe('FormArrayValuePipe', () => {
  it('create an instance', () => {
    const pipe = new FormArrayValuePipe();
    expect(pipe).toBeTruthy();
  });
});
