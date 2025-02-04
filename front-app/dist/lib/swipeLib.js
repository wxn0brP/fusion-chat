import hub from "../hub.js";
hub("swipeLib");
function setupSwipe(element, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) {
    let startX, startY, endX, endY;
    const swipeThreshold = 100;
    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        if (shouldIgnoreSwipe(e.target))
            return;
        handleSwipe();
    });
    element.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        element.addEventListener('mouseup', onMouseUp);
    });
    function onMouseUp(e) {
        endX = e.clientX;
        endY = e.clientY;
        if (!shouldIgnoreSwipe(e.target))
            handleSwipe();
        element.removeEventListener('mouseup', onMouseUp);
    }
    function handleSwipe() {
        let diffX = startX - endX;
        let diffY = startY - endY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) < swipeThreshold)
                return;
            if (diffX > 0) {
                if (onSwipeLeft)
                    onSwipeLeft();
            }
            else {
                if (onSwipeRight)
                    onSwipeRight();
            }
        }
        else {
            if (Math.abs(diffY) < swipeThreshold)
                return;
            if (diffY > 0) {
                if (onSwipeUp)
                    onSwipeUp();
            }
            else {
                if (onSwipeDown)
                    onSwipeDown();
            }
        }
    }
    function shouldIgnoreSwipe(target) {
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
//# sourceMappingURL=swipeLib.js.map