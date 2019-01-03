/**
 * Interface between client and core, to transmit information about elements.
 *
 * @private
 * @export
 * @interface IE2eElement
 */
export interface IE2eElement {
    uid: string;
    id: string;
    parent?: string;
    type: string;
    nativeElement: Element;
    children: IE2eElement[];
}
