 // Making popups draggable
export default function makeDraggable(element, exceptionSelector){
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener("mousedown", (e) => {
        if (e.target.closest(exceptionSelector)) return;

        isDragging = true;

        // Calculate offset between mouse and keypad top-left corner
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        element.classList.add("dragging");
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // Move keypad to new mouse position minus the initial offset
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.bottom = "auto"; // override bottom if previously set
        element.style.transform = "none"; // remove translateX(-50%)
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            element.classList.remove("dragging");
        }
    });
}