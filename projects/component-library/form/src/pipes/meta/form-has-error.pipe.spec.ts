import { FormHasErrorPipe } from './form-has-error.pipe';

describe('FormHasErrorPipe', () => {
    it('create an instance', () => {
        const pipe = new FormHasErrorPipe();
        expect(pipe).toBeTruthy();
    });
});
