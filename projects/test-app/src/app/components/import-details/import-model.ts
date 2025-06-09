export interface ImportModel {
    name: string;
    componentImports?: ImportName[];
    optionalComponentImports?: ImportName[];
    importFunctions?: ImportName[];
    optionalImportFunctions?: ImportName[];
    providerImports?: ImportName[];
    optionalProviderImports?: ImportName[];
    providerImportFunctions?: ImportName[];
    optionalProviderImportFunctions?: ImportName[];
}

export interface ImportName {
    name: string;
    from: string;
    info?: string;
}
