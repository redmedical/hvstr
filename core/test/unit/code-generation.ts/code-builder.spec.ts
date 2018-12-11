import { QueuedCodeBuilder } from '../../../src';

describe('QueuedCodeBuilder', () => {
    let cb: QueuedCodeBuilder;
    const tabDepth = '    ';

    beforeEach(()=>{
        cb = new QueuedCodeBuilder(tabDepth);
    });

    it('should be truethy', () => {
        expect(cb).toBeTruthy();
    });

    it('should generate empty string without any commands', () => {
        expect(cb.getResult()).toBe('');
    });

    it('should add a single Line', () => {
        cb.addLine('I am a line');
        expect(cb.getResult()).toEqual('I am a line\n');
    });

    it('should two a single Line', () => {
        cb
            .addLine('I am a line')
            .addLine('I am a other line');
        expect(cb.getResult()).toEqual('I am a line\nI am a other line\n');
    });

    it('should add tab-depth', () => {
        cb
            .addLine('I am a line')
            .increaseDepth()
            .addLine('I am a other line');
        expect(cb.getResult()).toEqual(`I am a line\n${tabDepth}I am a other line\n`);
    });

    it('should decrease tab-depth', () => {
        cb
            .addLine('I am a line')
            .increaseDepth()
            .addLine('I am a other line')
            .decreaseDepth()
            .addLine('I am a third line');
        expect(cb.getResult()).toEqual(`I am a line\n${tabDepth}I am a other line\nI am a third line\n`);
    });

    it('should add multiple', () => {
        cb
            .addLine('I am a line')
            .increaseDepth()
            .increaseDepth()
            .increaseDepth()
            .increaseDepth()
            .addLine('I am a other line');
        expect(cb.getResult()).toEqual(`I am a line\n${tabDepth.repeat(4)}I am a other line\n`);
    });

    it('should add conditional line', () => {
        cb.addConditionalLine('I am a line', true);
        expect(cb.getResult()).toEqual('I am a line\n');
    });

    it('should not add conditional line', () => {
        cb.addConditionalLine('I am a line', false);
        expect(cb.getResult()).toEqual('');
    });

    it('should add dynamic line', () => {
        cb.addDynamicLine(() => 'I am a line');
        expect(cb.getResult()).toEqual('I am a line\n');
    });

    it('should add dynamic line, in right order', () => {
        cb
            .addLine('1')
            .addDynamicLine(() => '2')
            .addLine('3');
        expect(cb.getResult()).toEqual('1\n2\n3\n');
    });
});
