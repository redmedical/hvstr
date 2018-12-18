export interface IE2eElement {
    uid: string;
    id: string;
    parent?: string;
    type: string;
    nativeElement: Element;
    children: IE2eElement[];
}
