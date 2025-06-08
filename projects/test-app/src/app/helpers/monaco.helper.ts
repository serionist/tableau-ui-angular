export class MonacoHelper {
    static getOptions(lang: string) {
        return {
            theme: 'vs-dark',
            language: lang,
            lineNumbers: 'off',
            readOnly: true,
            folding: false,
            lineDecorationsWidth: 5,
            lineNumbersMinChars: 0,
            minimap: {
                enabled: false,
            },
        };
    }
}
