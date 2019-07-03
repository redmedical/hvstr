/**
 * Converts between all following letter cases:
 *    * camelCase
 *    * PascalCase
 *    * snake_case
 *    * kebab-case
 * @export
 * @class CaseConvert
 */
export class CaseConvert {
    /**
     * uses kebab-case as source for conversion
     *
     * @static
     * @memberof CaseConvert
     */
    public static fromKebab = {
        /**
         * converts kebab-case in camelCase
         *
         * @memberof CaseConvert.fromKebab
         */
        toCamel: (input: string) => {
            return input.replace(/(\-[a-z])/g, (part: string) => part.toUpperCase().replace('-', ''));
        },
        /**
         * converts kebab-case in PascalCase
         *
         * @memberof CaseConvert.fromKebab
         */
        toPascal: (input: string) => {
            const camel = CaseConvert.fromKebab.toCamel(input);
            return CaseConvert.firstToUpperCase(camel);
        },
        /**
         * converts kebab-case in snake_case
         *
         * @memberof CaseConvert.fromKebab
         */
        toSnake: (input: string) => {
            return input.replace(/\-/g, (part: string) => '_');
        }
    };
    /**
     * uses snake_case as source for conversion
     *
     * @static
     * @memberof CaseConvert
     */
    public static fromSnake = {
        /**
         * converts snake_case in camelCase
         *
         * @memberof CaseConvert.fromSnake
         */
        toCamel: (input: string) => {
            return CaseConvert.fromKebab.toCamel(CaseConvert.fromSnake.toKebab(input));
        },
        /**
         * converts snake_case in PascalCase
         *
         * @memberof CaseConvert.fromSnake
         */
        toPascal: (input: string) => {
            return CaseConvert.fromKebab.toPascal(CaseConvert.fromSnake.toKebab(input));
        },
        /**
         * converts snake_case in kebab-case
         *
         * @memberof CaseConvert.fromSnake
         */
        toKebab: (input: string) => {
            return input.replace(/\_/g, (part: string) => '-');
        }
    };
    /**
     * uses camelCase as source for conversion
     *
     * @static
     * @memberof CaseConvert
     */
    public static fromCamel = {
        /**
         * converts camelCase in kebab-case
         *
         * @memberof CaseConvert.fromCamel
         */
        toKebab: (input: string) => {
            return input.replace(/[A-Z][a-z0-9]*/g, (part: string) => { return '-' + part.toLocaleLowerCase(); });
        },
        /**
        * converts camelCase in PascalCase
        *
        * @memberof CaseConvert.fromCamel
        */
        toPascal: (input: string) => {
            return CaseConvert.firstToUpperCase(input);
        },
        /**
        * converts camelCase in snake_case
        *
        * @memberof CaseConvert.fromCamel
        */
        toSnake: (input: string) => {
            return CaseConvert.fromKebab.toSnake(CaseConvert.fromCamel.toKebab(input));
        }
    };
    /**
     * uses PascalCase as source for conversion
     *
     * @static
     * @memberof CaseConvert
     */
    public static fromPascal = {
        /**
        * converts PascalCase in kebab-case
        *
        * @memberof CaseConvert.fromPascal
        */
        toKebab: (input: string) => {
            return CaseConvert.fromCamel.toKebab(CaseConvert.firstToLowerCase(input));
        },
        /**
         * converts PascalCase in camelCase
         *
         * @memberof CaseConvert.fromPascal
         */
        toCamel: (input: string) => {
            return CaseConvert.firstToLowerCase(input);
        },
        /**
         * converts PascalCase in snake_case
         *
         * @memberof CaseConvert.fromPascal
         */
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
