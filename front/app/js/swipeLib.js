function setupSwipe(element, onSwipeLeft=()=>{}, onSwipeRight=()=>{}, onSwipeUp=()=>{}, onSwipeDown=()=>{}){
    let startX, startY, endX, endY;

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;

        handleSwipe();
    });

    element.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;

        element.addEventListener('mouseup', onMouseUp);
    });

    function onMouseUp(e){
        endX = e.clientX;
        endY = e.clientY;

        handleSwipe();
        element.removeEventListener('mouseup', onMouseUp);
    }

    function handleSwipe(){
        let diffX = startX - endX;
        let diffY = startY - endY;

        if(Math.abs(diffX) > Math.abs(diffY)){
            if(Math.abs(diffX) < 75) return;
            if(diffX > 0){
                if(onSwipeLeft) onSwipeLeft();
            }else{
                if(onSwipeRight) onSwipeRight();
            }
        }else{
            if(Math.abs(diffY) < 75) return;
            if(diffY > 0){
                if(onSwipeUp) onSwipeUp();
            }else{
                if(onSwipeDown) onSwipeDown();
            }
        }
    }
}