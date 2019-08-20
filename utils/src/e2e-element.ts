/**
 * Interface between client and core, to transmit information about elements.
 *
 * @private
 * @export
 * @interface IE2eElement
 */
export interface IE2eElement extends ISimpleE2EElement {
    uid: string;
    children: IE2eElement[];
}

export interface ISimpleE2EElement {
    id: string;
    parent?: string;
    type: string;
    children: ISimpleE2EElement[];
}
