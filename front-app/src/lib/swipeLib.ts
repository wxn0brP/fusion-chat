import hub from "../hub";
hub("swipeLib");

type SwipeCallback = () => void;

function setupSwipe(
    element: HTMLElement,
    onSwipeLeft: SwipeCallback,
    onSwipeRight: SwipeCallback,
    onSwipeUp: SwipeCallback,
    onSwipeDown: SwipeCallback
) {
    let startX: number, startY: number, endX: number, endY: number;
    const swipeThreshold = 100;

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;

        if (shouldIgnoreSwipe(e.target as HTMLElement)) return;
        handleSwipe();
    });

    element.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;

        element.addEventListener('mouseup', onMouseUp);
    });

    function onMouseUp(e: MouseEvent) {
        endX = e.clientX;
        endY = e.clientY;

        if (!shouldIgnoreSwipe(e.target as HTMLElement)) handleSwipe();
        element.removeEventListener('mouseup', onMouseUp);
    }

    function handleSwipe() {
        let diffX = startX - endX;
        let diffY = startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) < swipeThreshold) return;
            if (diffX > 0) {
                if (onSwipeLeft) onSwipeLeft();
            } else {
                if (onSwipeRight) onSwipeRight();
            }
        } else {
            if (Math.abs(diffY) < swipeThreshold) return;
            if (diffY > 0) {
                if (onSwipeUp) onSwipeUp();
            } else {
                if (onSwipeDown) onSwipeDown();
            }
        }
    }

    function shouldIgnoreSwipe(target: HTMLElement) {
        const diffX = Math.abs(startX - endX);
        const diffY = Math.abs(startY - endY);

        if (diffX > diffY && target.scrollWidth != target.clientWidth)
            return true;

        if (diffY > diffX && target.scrollHeight != target.clientHeight)
            return true;

        return false;
    }
}

export default setupSwipe;