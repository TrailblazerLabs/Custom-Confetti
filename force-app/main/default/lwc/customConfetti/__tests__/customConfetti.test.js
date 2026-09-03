import { createElement } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getThemeColors from '@salesforce/apex/ConfettiThemeController.getThemeColors';
import CustomConfetti from 'c/customConfetti';

const FIELD_PATH    = 'Opportunity.StageName';
const TRIGGER_VALUE = 'Closed Won';
const THEME_NAME    = 'Green_Yellow';
const THEME_COLORS  = ['#36C5F0', '#2EB67D', '#ECB22E', '#E01E5A'];

jest.mock(
    '@salesforce/apex/ConfettiThemeController.getThemeColors',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

function buildRecord(stageNameValue) {
    return {
        apiName: 'Opportunity',
        fields: {
            StageName: { value: stageNameValue, displayValue: stageNameValue }
        }
    };
}

function createConfetti() {
    const element = createElement('c-custom-confetti', { is: CustomConfetti });
    element.recordId    = '006000000000001AAA';
    element.fieldPath   = FIELD_PATH;
    element.triggerValue = TRIGGER_VALUE;
    element.themeName   = THEME_NAME;
    document.body.appendChild(element);
    return element;
}

// Flushes the wire adapter microtasks, then runs the component's launch-delay timer
async function settle() {
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(500);
}

describe('c-custom-confetti', () => {
    let getContextSpy;
    let rafSpy;

    beforeEach(() => {
        jest.useFakeTimers();
        getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            clearRect:  jest.fn(),
            save:       jest.fn(),
            restore:    jest.fn(),
            translate:  jest.fn(),
            rotate:     jest.fn(),
            beginPath:  jest.fn(),
            arc:        jest.fn(),
            moveTo:     jest.fn(),
            lineTo:     jest.fn(),
            closePath:  jest.fn(),
            fill:       jest.fn(),
            fillRect:   jest.fn()
        });
        rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('does not launch confetti when the record loads already matching the trigger value', async () => {
        createConfetti();
        getThemeColors.emit(THEME_COLORS);
        getRecord.emit(buildRecord(TRIGGER_VALUE));

        await settle();

        expect(rafSpy).not.toHaveBeenCalled();
        expect(getContextSpy).not.toHaveBeenCalled();
    });

    it('launches confetti when the field changes into the trigger value', async () => {
        createConfetti();
        getThemeColors.emit(THEME_COLORS);

        getRecord.emit(buildRecord('Prospecting'));
        await settle();
        expect(rafSpy).not.toHaveBeenCalled();

        getRecord.emit(buildRecord(TRIGGER_VALUE));
        await settle();

        expect(getContextSpy).toHaveBeenCalledWith('2d');
        expect(rafSpy).toHaveBeenCalledTimes(1);
    });

    it('does not launch confetti when the field changes to a non-matching value', async () => {
        createConfetti();
        getThemeColors.emit(THEME_COLORS);

        getRecord.emit(buildRecord('Prospecting'));
        await settle();

        getRecord.emit(buildRecord('Negotiation'));
        await settle();

        expect(rafSpy).not.toHaveBeenCalled();
    });

    it('launches confetti again after the value moves away and returns to the trigger value', async () => {
        createConfetti();
        getThemeColors.emit(THEME_COLORS);

        getRecord.emit(buildRecord('Prospecting'));
        await settle();

        getRecord.emit(buildRecord(TRIGGER_VALUE));
        await settle();
        expect(rafSpy).toHaveBeenCalledTimes(1);

        getRecord.emit(buildRecord('Negotiation'));
        await settle();
        expect(rafSpy).toHaveBeenCalledTimes(1);

        getRecord.emit(buildRecord(TRIGGER_VALUE));
        await settle();

        expect(rafSpy).toHaveBeenCalledTimes(2);
    });
});
