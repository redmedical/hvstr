import { IPageObjectInFabrication } from './page-object-in-fabrication';

/**
 * @private
 */
export interface IChildPage {
    name: string;
    pageObject: IPageObjectInFabrication;
}
