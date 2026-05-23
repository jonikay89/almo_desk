import UIViewController from './UIViewController.js';
import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { UIPresentationController } from './UIPresentationController.js';

const UIPopoverArrowDirection = {
    up: 1 << 0,
    down: 1 << 1,
    left: 1 << 2,
    right: 1 << 3,
    any: (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3),
    unknown: 0,
};

class UIPopoverPresentationController extends UIPresentationController {
    constructor(presentedViewController, presentingViewController) {
        super(presentedViewController, presentingViewController);
        this._barButtonItem = null;
        this._sourceView = null;
        this._sourceRect = { x: 0, y: 0, width: 0, height: 0 };
        this._permittedArrowDirections = UIPopoverArrowDirection.any;
        this._arrowDirection = UIPopoverArrowDirection.unknown;
        this._backgroundColor = null;
        this._popoverLayoutMargins = { top: 10, bottom: 10, left: 10, right: 10 };
        this._passthroughViews = [];
        this._canOverlapSourceViewRect = false;
        this._delegate = null;
    }

    get barButtonItem() { return this._barButtonItem; }
    set barButtonItem(value) { this._barButtonItem = value; }
    get sourceView() { return this._sourceView; }
    set sourceView(value) { this._sourceView = value; }
    get sourceRect() { return this._sourceRect; }
    set sourceRect(value) { this._sourceRect = { ...value }; }
    get permittedArrowDirections() { return this._permittedArrowDirections; }
    set permittedArrowDirections(value) { this._permittedArrowDirections = value; }
    get arrowDirection() { return this._arrowDirection; }
    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; }
    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    frameOfPresentedViewInContainerView() {
        if (!this._containerView) return { x: 0, y: 0, width: 0, height: 0 };

        const containerBounds = this._containerView._bounds;
        const preferredSize = this._presentedViewController?.preferredContentSize || { width: 320, height: 400 };
        const margins = this._popoverLayoutMargins;

        let sourceRect = this._sourceRect;
        if (this._sourceView && this._sourceView.convertRect) {
            const windowFrame = this._sourceView.convertRect(this._sourceView._frame, null);
            sourceRect = {
                x: windowFrame.x,
                y: windowFrame.y,
                width: this._sourceView._bounds.width,
                height: this._sourceView._bounds.height,
            };
        }

        const sourceCenterX = sourceRect.x + sourceRect.width / 2;
        const sourceCenterY = sourceRect.y + sourceRect.height / 2;

        const popoverWidth = Math.min(preferredSize.width, containerBounds.width - margins.left - margins.right);
        const popoverHeight = Math.min(preferredSize.height, containerBounds.height - margins.top - margins.bottom);

        let frame = { x: 0, y: 0, width: popoverWidth, height: popoverHeight };

        const canGoUp = sourceRect.y - margins.top - popoverHeight >= 0;
        const canGoDown = sourceRect.y + sourceRect.height + margins.bottom + popoverHeight <= containerBounds.height;
        const canGoLeft = sourceRect.x - margins.left - popoverWidth >= 0;
        const canGoRight = sourceRect.x + sourceRect.width + margins.right + popoverWidth <= containerBounds.width;

        let bestArrow = null;
        let bestScore = -1;

        const directions = [
            { dir: UIPopoverArrowDirection.down, possible: canGoUp, x: sourceCenterX - popoverWidth / 2, y: sourceRect.y - popoverHeight },
            { dir: UIPopoverArrowDirection.up, possible: canGoDown, x: sourceCenterX - popoverWidth / 2, y: sourceRect.y + sourceRect.height },
            { dir: UIPopoverArrowDirection.right, possible: canGoLeft, x: sourceRect.x - popoverWidth, y: sourceCenterY - popoverHeight / 2 },
            { dir: UIPopoverArrowDirection.left, possible: canGoRight, x: sourceRect.x + sourceRect.width, y: sourceCenterY - popoverHeight / 2 },
        ];

        for (const d of directions) {
            if (!(this._permittedArrowDirections & d.dir)) continue;
            if (d.possible) {
                const score = Math.abs(d.x - containerBounds.width / 2) + Math.abs(d.y - containerBounds.height / 2);
                if (bestArrow === null || d.possible && !bestArrow?.possible || score < bestScore) {
                    bestArrow = d;
                    bestScore = score;
                }
            }
        }

        if (!bestArrow) {
            bestArrow = directions[0];
        }

        this._arrowDirection = bestArrow.dir;
        frame.x = Math.max(margins.left, Math.min(bestArrow.x, containerBounds.width - popoverWidth - margins.right));
        frame.y = Math.max(margins.top, Math.min(bestArrow.y, containerBounds.height - popoverHeight - margins.bottom));

        return frame;
    }

    _setup(containerView) {
        super._setup(containerView);
        if (this._chromeView) {
            this._chromeView._element.style.background = 'transparent';
        }
        if (this._presentedView) {
            this._presentedView.cornerRadius = 12;
            this._presentedView.clipsToBounds = true;
            if (this._presentedView._element) {
                this._presentedView._element.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
                this._presentedView._element.style.zIndex = '1000';
            }
        }
    }

    adaptivePresentationStyle() {
        return 'popover';
    }
}

export {
    UIPopoverPresentationController,
    UIPopoverArrowDirection,
};
export default UIPopoverPresentationController;
