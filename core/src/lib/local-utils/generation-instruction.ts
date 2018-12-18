import { IPageObjectInFabrication } from '../page-object/page-object-in-fabrication';
import { Awaiter } from './types';
export interface IGenerationInstruction {
    name?: string;
    byRoute?: string;
    byAction?: () => void;
    byActionAsync?: () => Promise<void>;
    restrictToElements?: string[];
    excludeElements?: string[];
    path?: string;
    from?: IPageObjectInFabrication;
    awaiter?: Awaiter;
    virtual?: boolean;
}
