import * as NodePath from 'path';
import * as fs from 'fs';
import { CaseConvert } from './case-converter';
/**
 * @private
 */
const mkdirp = require('mkdirp');

/**
 * @private
 */
export class ProjectPathUtil {

    root = new Path(undefined, this.appRoot);
    e2eTests = new Path(this.root, this._e2eTests);
    pageObjects = new Path(this.e2eTests, '/page-objects');
    generatedPageObjects = new Path(this.pageObjects, '/generated');

    constructor(
        private appRoot: string,
        private _e2eTests: string,
    ){}
    public createAllDirectories(): void {
        this.e2eTests.mkdirp();
        this.pageObjects.mkdirp();
        this.generatedPageObjects.mkdirp();
    }
    public getFilePath(pageObjectName: string, instructPath: string | undefined, isExtendingPageObject: Boolean ): Path {
        let root: Path;
        if (isExtendingPageObject) {
            root = this.pageObjects;
        } else {
            root = this.generatedPageObjects;
        }
        const fileName = CaseConvert.fromPascal.toKebab((isExtendingPageObject ? '' : 'Generated') + pageObjectName);
        return new Path(root, instructPath || '', fileName, 'ts')
    }
}

/**
 * @private
 */
export class Path {
    constructor(
        public root: Path | undefined,
        public rootPath: string,
        public fileName?: string,
        public type?: string
    ) {}

    public get exists(): boolean {
        return fs.existsSync(this.fullName);
    }

    public get directory(): string {
        return (this.root ? this.root!.directory : '') + this.rootPath;
    }

    public get fullPath(): string {
        return this.directory + ('/' + this.fileName || '');
    }

    public get fullName(): string {
        return [this.directory, this.name].filter(Boolean).join('/');
    }

    public get name(): string {
        return [this.fileName, this.type].filter(Boolean).join('.');
    }

    public get isFile(): boolean {
        return Boolean(this.fileName);
    }

    public relative(to: string | Path): string {
        if(typeof to === 'string') {
            return './' + NodePath.relative(this.directory, to as string).replace(/\\/g, '/');
        } else {
            return './' + NodePath.relative(this.directory, (to as Path).directory).replace(/\\/g, '/');
        }
    }

    public mkdirp(): void {
        mkdirp.sync(this.directory);
    }
}
