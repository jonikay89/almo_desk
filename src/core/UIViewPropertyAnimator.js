import NSObject from './NSObject.js';
import UIColor from './UIColor.js';
import { CABasicAnimation, CASpringAnimation } from './CALayer.js';

class UIViewPropertyAnimator extends NSObject {
    static get runningAnimators() {
        return UIViewPropertyAnimator._runningAnimators.slice();
    }

    constructor(duration, timingParameters, animations) {
        super();
        this._duration = duration ?? 0;
        this._timingParameters = timingParameters instanceof UITimingCurveProvider
            ? timingParameters
            : new UICubicTimingParameters(timingParameters);
        this._animations = animations || null;
        this._completionAnimations = null;
        this._state = 'inactive';
        this._fractionComplete = 0;
        this._isReversed = false;
        this._isUserInteractionEnabled = true;
        this._isManualHitTestingEnabled = false;
        this._completion = null;
        this._startTime = 0;
        this._runningAnimation = null;
        this._pausedValue = 0;
    }

    get state() { return this._state; }
    get isRunning() { return this._state === 'active' && !this._isPaused; }
    get isReversed() { return this._isReversed; }
    set isReversed(value) { this._isReversed = value; }
    get isUserInteractionEnabled() { return this._isUserInteractionEnabled; }
    set isUserInteractionEnabled(value) { this._isUserInteractionEnabled = value; }
    get isManualHitTestingEnabled() { return this._isManualHitTestingEnabled; }
    set isManualHitTestingEnabled(value) { this._isManualHitTestingEnabled = value; }

    get fractionComplete() { return this._fractionComplete; }
    set fractionComplete(value) {
        value = Math.max(0, Math.min(1, value));
        this._fractionComplete = value;
        if (this._animations) {
            this._applyAnimations(value);
        }
    }

    get duration() { return this._duration; }
    set duration(value) { this._duration = value; }

    get timingParameters() { return this._timingParameters; }

    startAnimation() {
        if (this._state === 'stopped') return;

        if (this._state === 'inactive' || this._state === 'stopped') {
            this._state = 'active';
            this._isPaused = false;
            this._startTime = performance.now();
            this._fractionComplete = 0;
        } else if (this._state === 'active' && this._isPaused) {
            this._isPaused = false;
            this._startTime = performance.now() - (this._fractionComplete * this._duration * 1000);
        }

        this._addRunning();
        this._tick();
    }

    stopAnimation(withoutFinishing) {
        if (this._state !== 'active') return;
        this._removeRunning();

        if (withoutFinishing) {
            this._state = 'stopped';
            if (this._completion) this._completion(false);
        } else {
            this._state = 'stopped';
            this.fractionComplete = 1;
            if (this._completion) this._completion(true);
        }
    }

    pauseAnimation() {
        if (this._state !== 'active') return;
        this._isPaused = true;
        this._pausedValue = this._fractionComplete;
        this._removeRunning();

        if (this._runningAnimation) {
            this._runningAnimation = null;
        }
    }

    finishAnimation(atPosition) {
        const pos = atPosition ?? 1;
        this._removeRunning();
        this._fractionComplete = pos;
        this._state = 'inactive';
        this._isPaused = false;
        if (this._completion) this._completion(pos >= 1);
    }

    addAnimations(animations, delayFactor = 0) {
        if (this._state === 'inactive') {
            this._animations = animations;
        } else if (this._state === 'active') {
            this._completionAnimations = animations;
        }
    }

    addCompletion(completion) {
        this._completion = completion;
    }

    continueAnimation(withTimingParameters, durationFactor) {
        if (withTimingParameters) {
            this._timingParameters = withTimingParameters;
        }
        if (durationFactor !== undefined) {
            this._duration = this._duration * durationFactor;
        }
        if (this._isPaused) {
            this.startAnimation();
        }
    }

    _applyAnimations(progress) {
        if (!this._animations) return;
        const timingCurve = this._timingParameters;
        const easedProgress = timingCurve
            ? timingCurve._applyTimingFunction(progress)
            : progress;

        if (typeof this._animations === 'function') {
            this._animations(easedProgress);
        }
    }

    _tick() {
        if (this._state !== 'active' || this._isPaused) return;

        const elapsed = performance.now() - this._startTime;
        const rawProgress = Math.min(elapsed / (this._duration * 1000), 1);
        this._fractionComplete = this._isReversed ? (1 - rawProgress) : rawProgress;
        this._applyAnimations(this._fractionComplete);

        if (rawProgress >= 1) {
            this._state = 'inactive';
            this._fractionComplete = 1;
            this._removeRunning();
            if (this._completion) this._completion(true);
            return;
        }

        requestAnimationFrame(() => this._tick());
    }

    _addRunning() {
        if (!UIViewPropertyAnimator._runningAnimators.includes(this)) {
            UIViewPropertyAnimator._runningAnimators.push(this);
        }
    }

    _removeRunning() {
        const idx = UIViewPropertyAnimator._runningAnimators.indexOf(this);
        if (idx !== -1) UIViewPropertyAnimator._runningAnimators.splice(idx, 1);
    }

    static runningAnimatorCount() {
        return UIViewPropertyAnimator._runningAnimators.length;
    }
}
UIViewPropertyAnimator._runningAnimators = [];

class UITimingCurveProvider {
    constructor() {}
    _applyTimingFunction(progress) { return progress; }
}

class UICubicTimingParameters extends UITimingCurveProvider {
    constructor(options = {}) {
        super();
        if (options instanceof Array && options.length === 4) {
            this._controlPoint1 = { x: options[0], y: options[1] };
            this._controlPoint2 = { x: options[2], y: options[3] };
        } else {
            this._controlPoint1 = options.controlPoint1 || { x: 0.25, y: 0.1 };
            this._controlPoint2 = options.controlPoint2 || { x: 0.25, y: 1.0 };
        }
    }

    get controlPoint1() { return this._controlPoint1; }
    get controlPoint2() { return this._controlPoint2; }

    _applyTimingFunction(t) {
        return UICubicTimingParameters._cubicBezier(
            t,
            this._controlPoint1.x, this._controlPoint1.y,
            this._controlPoint2.x, this._controlPoint2.y
        );
    }

    static _cubicBezier(t, p1x, p1y, p2x, p2y) {
        const cx = 3 * p1x;
        const bx = 3 * (p2x - p1x) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * p1y;
        const by = 3 * (p2y - p1y) - cy;
        const ay = 1 - cy - by;

        const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
        const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
        const sampleCurveDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

        const solveCurveX = (x) => {
            let t2 = x;
            for (let i = 0; i < 8; i++) {
                const x2 = sampleCurveX(t2) - x;
                if (Math.abs(x2) < 1e-6) return t2;
                const d2 = sampleCurveDerivativeX(t2);
                if (Math.abs(d2) < 1e-6) break;
                t2 -= x2 / d2;
            }
            let t0 = 0, t1 = 1;
            t2 = x;
            while (t0 < t1) {
                const x2 = sampleCurveX(t2);
                if (Math.abs(x2 - x) < 1e-6) return t2;
                if (x > x2) t0 = t2; else t1 = t2;
                t2 = (t1 - t0) * 0.5 + t0;
            }
            return t2;
        };

        return sampleCurveY(solveCurveX(t));
    }
}

class UISpringTimingParameters extends UITimingCurveProvider {
    constructor(options = {}) {
        super();
        this._dampingRatio = options.dampingRatio ?? 0.8;
        this._frequencyResponse = options.frequencyResponse ?? 0.8;
        this._mass = options.mass ?? 1;
        this._stiffness = options.stiffness ?? 100;
        this._damping = options.damping ?? 10;
        this._initialVelocity = options.initialVelocity ?? { x: 0, y: 0 };
    }

    get dampingRatio() { return this._dampingRatio; }
    get frequencyResponse() { return this._frequencyResponse; }

    _applyTimingFunction(t) {
        const omega = Math.sqrt(this._stiffness / this._mass);
        const zeta = this._damping / (2 * Math.sqrt(this._stiffness * this._mass));

        if (zeta < 1) {
            const omegaD = omega * Math.sqrt(1 - zeta * zeta);
            return 1 - Math.exp(-zeta * omega * t) *
                (Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t));
        }
        return 1 - Math.exp(-omega * t) * (1 + omega * t);
    }
}

class UIViewAnimating {
    static get state() {
        return { inactive: 'inactive', active: 'active', stopped: 'stopped' };
    }
}

export {
    UIViewPropertyAnimator,
    UITimingCurveProvider,
    UICubicTimingParameters,
    UISpringTimingParameters,
    UIViewAnimating,
};
export default UIViewPropertyAnimator;
