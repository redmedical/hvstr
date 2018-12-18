import { IPageObjectInFabrication } from './page-object-in-fabrication';

export interface IChildPage {
    name: string;
    pageObject: IPageObjectInFabrication;
}
