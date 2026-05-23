import NSObject from './NSObject.js';
import UIView from './UIView.js';
import UIColor from './UIColor.js';

const UIModalPresentationStyle = {
    fullScreen: 'fullScreen',
    pageSheet: 'pageSheet',
    formSheet: 'formSheet',
    currentContext: 'currentContext',
    custom: 'custom',
    overFullScreen: 'overFullScreen',
    overCurrentContext: 'overCurrentContext',
    popover: 'popover',
    none: 'none',
    automatic: 'automatic',
};

const UIModalTransitionStyle = {
    coverVertical: 'coverVertical',
    flipHorizontal: 'flipHorizontal',
    crossDissolve: 'crossDissolve',
    partialCurl: 'partialCurl',
};

class UIViewControllerTransitioningDelegate {
    animationControllerForPresented(presenting, source) { return null; }
    animationControllerForDismissed(dismissed) { return null; }
    presentationControllerForPresented(presenting, source) { return null; }
    interactionControllerForDismissal(animator) { return null; }
    interactionControllerForPresentation(animator) { return null; }
}

class UIViewControllerAnimatedTransitioning {
    transitionDuration(transitionContext) { return 0.35; }
    animateTransition(transitionContext) {}
    animationEnded(transitionCompleted) {}
}

class UIViewControllerContextTransitioning {
    constructor(fromVC, toVC, containerView) {
        this._fromViewController = fromVC;
        this._toViewController = toVC;
        this._containerView = containerView;
        this._isAnimated = true;
        this._isInteractive = false;
        this._transitionWasCancelled = false;
        this._percentComplete = 0;
        this._completionSpeed = 1;
        this._completionCurve = 'easeInOut';
    }

    get containerView() { return this._containerView; }
    get isAnimated() { return this._isAnimated; }
    get isInteractive() { return this._isInteractive; }
    get transitionWasCancelled() { return this._transitionWasCancelled; }
    get percentComplete() { return this._percentComplete; }
    get completionSpeed() { return this._completionSpeed; }
    get completionCurve() { return this._completionCurve; }

    viewControllerForKey(key) {
        if (key === 'from') return this._fromViewController;
        if (key === 'to') return this._toViewController;
        return null;
    }

    viewForKey(key) {
        const vc = this.viewControllerForKey(key);
        return vc ? vc.view : null;
    }

    initialFrameForViewController(vc) {
        return vc?.view?.frame || { x: 0, y: 0, width: 0, height: 0 };
    }

    finalFrameForViewController(vc) {
        return vc?.view?.frame || { x: 0, y: 0, width: 0, height: 0 };
    }

    completeTransition(didComplete) {
        this._transitionWasCancelled = !didComplete;
        if (this._onComplete) this._onComplete(didComplete);
    }

    updateInteractiveTransition(percentComplete) {
        this._percentComplete = percentComplete;
    }

    finishInteractiveTransition() {
        this._isInteractive = false;
    }

    cancelInteractiveTransition() {
        this._transitionWasCancelled = true;
        this._isInteractive = false;
    }

    pauseInteractiveTransition() {}
}

class UIPresentationController extends NSObject {
    constructor(presentedViewController, presentingViewController) {
        super();
        this._presentedViewController = presentedViewController;
        this._presentingViewController = presentingViewController;
        this._containerView = null;
        this._chromeView = null;
        this._presentedView = null;
        this._delegate = null;
    }

    get presentedViewController() { return this._presentedViewController; }
    get presentingViewController() { return this._presentingViewController; }
    get containerView() { return this._containerView; }
    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    get presentedView() {
        return this._presentedViewController?.view || null;
    }

    frameOfPresentedViewInContainerView() {
        if (!this._containerView) return { x: 0, y: 0, width: 0, height: 0 };
        return {
            x: 0, y: 0,
            width: this._containerView._bounds.width,
            height: this._containerView._bounds.height,
        };
    }

    presentationTransitionWillBegin() {}
    presentationTransitionDidEnd(completed) {}
    dismissalTransitionWillBegin() {}
    dismissalTransitionDidEnd(completed) {}

    containerViewWillLayoutSubviews() {
        if (this._presentedView) {
            this._presentedView.frame = this.frameOfPresentedViewInContainerView();
        }
    }

    containerViewDidLayoutSubviews() {}

    preferredContentSizeDidChangeForChildContentContainer(container) {}
    sizeForChildContentContainer(container, withParentContainerSize) {
        return withParentContainerSize;
    }

    shouldPresentInFullscreen() { return true; }
    shouldRemovePresentersView() { return false; }

    adaptivePresentationStyle() { return UIModalPresentationStyle.fullScreen; }
    adaptivePresentationStyleForTraitCollection(traitCollection) {
        return this.adaptivePresentationStyle();
    }

    _setup(containerView) {
        this._containerView = containerView;

        this._chromeView = new UIView();
        this._chromeView.init();
        this._chromeView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.4);
        this._chromeView.frame = {
            x: 0, y: 0,
            width: containerView._bounds.width,
            height: containerView._bounds.height,
        };
        this._chromeView._element.style.transition = 'opacity 0.3s';
        this._chromeView._element.style.zIndex = '999';
        this._chromeView._element.style.pointerEvents = 'auto';

        this._chromeView._element.addEventListener('click', () => {
            if (this._presentingViewController) {
                this._presentingViewController.dismissViewController(true);
            }
        });

        containerView.addSubview(this._chromeView);

        if (this._presentedViewController?.view) {
            this._presentedView = this._presentedViewController.view;
        }
    }

    _teardown() {
        if (this._chromeView) {
            this._chromeView.removeFromSuperview();
            this._chromeView = null;
        }
        this._containerView = null;
        this._presentedView = null;
    }
}

class UIPageSheetPresentationController extends UIPresentationController {
    constructor(presentedViewController, presentingViewController) {
        super(presentedViewController, presentingViewController);
        this._detents = [UISheetPresentationDetent.medium(), UISheetPresentationDetent.large()];
        this._selectedDetent = null;
        this._largestUndimmedDetentIdentifier = null;
        this._prefersGrabberVisible = false;
        this._prefersScrollingExpandsWhenScrolledToEdge = true;
        this._prefersEdgeAttachedInCompactHeight = false;
        this._prefersLargestUndimmedDetent = null;
        this._widthFollowsPreferredContentSizeWhenEdgeAttached = false;
    }

    frameOfPresentedViewInContainerView() {
        if (!this._containerView) return { x: 0, y: 0, width: 0, height: 0 };
        const containerBounds = this._containerView._bounds;
        const maxWidth = Math.min(500, containerBounds.width - 40);
        const maxDetent = this._detents[this._detents.length - 1];
        const height = maxDetent._resolvedHeight(containerBounds.height);
        const x = (containerBounds.width - maxWidth) / 2;

        return { x, y: containerBounds.height - height, width: maxWidth, height };
    }

    adaptivePresentationStyle() { return UIModalPresentationStyle.pageSheet; }

    _setup(containerView) {
        super._setup(containerView);
        if (this._chromeView) {
            this._chromeView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.3);
        }
        if (this._presentedView) {
            this._presentedView.cornerRadius = 12;
            this._presentedView.clipsToBounds = true;
            if (this._presentedView._element) {
                this._presentedView._element.style.boxShadow = '0 -2px 20px rgba(0,0,0,0.15)';
                this._presentedView._element.style.zIndex = '1000';
            }
        }
    }
}

class UISheetPresentationDetent {
    constructor(identifier, resolver) {
        this._identifier = identifier;
        this._resolver = resolver;
    }

    get identifier() { return this._identifier; }

    _resolvedHeight(maximumAvailableHeight) {
        if (this._resolver) return this._resolver(maximumAvailableHeight);
        return maximumAvailableHeight;
    }

    static medium() {
        return new UISheetPresentationDetent('medium', (h) => h * 0.5);
    }

    static large() {
        return new UISheetPresentationDetent('large', (h) => h);
    }

    static custom(identifier, resolver) {
        return new UISheetPresentationDetent(identifier, resolver);
    }
}

export {
    UIModalPresentationStyle,
    UIModalTransitionStyle,
    UIViewControllerTransitioningDelegate,
    UIViewControllerAnimatedTransitioning,
    UIViewControllerContextTransitioning,
    UIPresentationController,
    UIPageSheetPresentationController,
    UISheetPresentationDetent,
};
export default UIPresentationController;
