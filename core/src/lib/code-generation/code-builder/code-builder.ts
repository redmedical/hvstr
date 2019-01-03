/**
 * @private
 */
export class CodeBuilder {
    private code: string;
    private tabDepth: number;
    constructor(private tab: string) {
        this.code = '';
        this.tabDepth = 0;
    }

    getResult(): string {
        return this.code;
    }

    addLine(content: string): CodeBuilder {
        if (!content) {
            this.code += '\n';
            return this;
        }
        this.addTabs();
        this.code += content + '\n';
        return this;
    }

    increaseDepth(): CodeBuilder {
        this.tabDepth++;
        return this;
    }

    decreaseDepth(): CodeBuilder {
        this.tabDepth--;
        return this;
    }

    reset(): CodeBuilder {
        this.code = '';
        return this;
    }

    private addTabs(): CodeBuilder {
        for (let i = 0; i < this.tabDepth; i++) {
            this.code += this.tab;
        }
        return this;
    }

}
