export class CaseConvert{
    public static fromKebab = {
        toCamel: (input: string) => {
           return input.replace(/(\-[a-z])/g, (part: string) => part.toUpperCase().replace('-',''));
        },
        toPascal: (input: string) => {
            const camel = CaseConvert.fromKebab.toCamel(input);
            return CaseConvert.firstToUpperCase(camel);
        },
        toSnake: (input: string) => {
            return input.replace(/\-/g, (part: string) => '_');
        }
    };
    public static fromSnake = {
        toCamel: (input: string) => {
            return CaseConvert.fromKebab.toCamel(CaseConvert.fromSnake.toKebab(input));
        },
        toPascal: (input: string) => {
            return CaseConvert.fromKebab.toPascal(CaseConvert.fromSnake.toKebab(input));
        },
        toKebab: (input: string) => {
            return input.replace(/\_/g, (part: string) => '-');
        }
    };
    public static fromCamel = {
        toKebab: (input: string) => {
            return input.replace(/[A-Z][a-z0-9]*/g, (part: string) => { return '-' + part.toLocaleLowerCase()});
        },
        toPascal: (input: string) => {
            return CaseConvert.firstToUpperCase(input);
        },
        toSnake: (input: string) => {
            return CaseConvert.fromKebab.toSnake(CaseConvert.fromCamel.toKebab(input));
        }
    };
    public static fromPascal = {
        toKebab: (input: string) => {
            return CaseConvert.fromCamel.toKebab(CaseConvert.firstToLowerCase(input));
        },
        toCamel: (input: string) => {
            return CaseConvert.firstToLowerCase(input);
        },
        toSnake: (input: string) => {
            return CaseConvert.fromCamel.toSnake(CaseConvert.firstToLowerCase(input));
        }
    };
    private static firstToUpperCase(input: string): string {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
    private static firstToLowerCase(input: string): string {
        return input.charAt(0).toLocaleLowerCase() + input.slice(1);
    }
}
