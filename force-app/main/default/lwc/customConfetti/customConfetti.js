import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getThemeColors from '@salesforce/apex/ConfettiThemeController.getThemeColors';

export default class CustomConfetti extends LightningElement {
    @api recordId;
    @api triggerValue;

    _fieldPath;
    _fields        = [];
    _themeColors   = null;
    _previousValue;
    _initialized   = false;
    _shouldFire    = false;
    _rafId         = null;
    _launchTimeoutId = null;

    // fieldPath setter keeps the wire fields array reactive
    @api
    get fieldPath() { return this._fieldPath; }
    set fieldPath(val) {
        this._fieldPath = val;
        this._fields    = val ? [val] : [];
    }

    // themeName setter clears cached colours so a theme change reloads them
    _themeName;
    @api
    get themeName() { return this._themeName; }
    set themeName(val) {
        this._themeName   = val;
        this._themeColors = null;
    }

    // Load colours from the Confetti_Theme__mdt Custom Metadata record
    @wire(getThemeColors, { developerName: '$_themeName' })
    wiredTheme({ data }) {
        if (data && data.length > 0) {
            this._themeColors = data;
            this._tryLaunch();
        }
    }

    // Watch the configured field and fire only on a transition INTO the trigger
    // value — never on initial load, where the field may already match
    @wire(getRecord, { recordId: '$recordId', fields: '$_fields' })
    wiredRecord({ data }) {
        if (!data || !this._fieldPath || !this.triggerValue) {
            return;
        }

        const val = getFieldValue(data, this._fieldPath);
        const isMatching = this._matchesTrigger(val);

        if (!this._initialized) {
            // First read of this record: just record the baseline, don't fire
            this._initialized = true;
        } else if (isMatching && !this._matchesTrigger(this._previousValue)) {
            this._shouldFire = true;
            this._tryLaunch();
        }

        this._previousValue = val;
    }

    _matchesTrigger(value) {
        return value != null && String(value) === String(this.triggerValue);
    }

    // Only launch once the field has transitioned to the trigger value AND theme colours are ready
    _tryLaunch() {
        if (this._shouldFire && this._themeColors) {
            this._shouldFire = false;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this._launchTimeoutId = setTimeout(() => this._launch(), 400);
        }
    }

    // Runs when the user navigates away mid-animation, or the component is
    // otherwise torn down — stops the pending launch and any running burst
    // so it doesn't keep animating (or leaking) against a detached canvas.
    disconnectedCallback() {
        if (this._launchTimeoutId) {
            clearTimeout(this._launchTimeoutId);
            this._launchTimeoutId = null;
        }
        this._cancelAnimation();
    }

    _cancelAnimation() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    _launch() {
        const canvas = this.template.querySelector('canvas');
        if (!canvas) return;

        // A rapid re-trigger (field flips out of and back into the trigger
        // value inside one burst) would otherwise leave two rAF loops
        // fighting over the same canvas — cancel any burst still in flight.
        this._cancelAnimation();

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors    = this._themeColors;
        const ctx       = canvas.getContext('2d');
        const COUNT     = 220;
        const SHAPES    = 3; // 0 = rectangle, 1 = circle, 2 = diamond
        const particles = [];

        for (let i = 0; i < COUNT; i++) {
            particles.push({
                x:        Math.random() * canvas.width,
                y:        -30 - Math.random() * canvas.height * 0.5,
                w:        Math.random() * 10 + 7,
                h:        Math.random() * 5 + 3,
                color:    colors[i % colors.length],
                shape:    i % SHAPES,
                rot:      Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.13,
                vy:       Math.random() * 3.2 + 1.8,
                vx:       (Math.random() - 0.5) * 2.8,
                wobble:   Math.random() * Math.PI * 2
            });
        }

        const DURATION  = 4800;
        const FADE_FROM = DURATION * 0.65;
        const startTime = performance.now();

        const frame = (now) => {
            const elapsed = now - startTime;
            if (elapsed > DURATION) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this._rafId = null;
                return;
            }

            const alpha = elapsed > FADE_FROM
                ? 1 - (elapsed - FADE_FROM) / (DURATION - FADE_FROM)
                : 1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.y      += p.vy;
                p.x      += p.vx + Math.sin(p.wobble) * 0.6;
                p.wobble += 0.04;
                p.rot    += p.rotSpeed;
                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;

                if (p.shape === 1) {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 2) {
                    ctx.beginPath();
                    ctx.moveTo(0, -p.h);
                    ctx.lineTo(p.w / 2, 0);
                    ctx.lineTo(0, p.h);
                    ctx.lineTo(-p.w / 2, 0);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                }

                ctx.restore();
            });

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this._rafId = requestAnimationFrame(frame);
        };

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._rafId = requestAnimationFrame(frame);
    }
}
