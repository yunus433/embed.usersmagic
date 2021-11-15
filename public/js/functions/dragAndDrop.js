/*
  Listens for containers with classname '.drag-and-drop-wrapper'.
  Assumes elements in the wrapper are vertically aligned, use 'display: flex; flex-direction: column;' to guarantee it.
  DO NOT use wrappers inside another, this would hurt functionality.
  Uses duplicateElement utility function, include utilities.js. 
*/

let dragAndDropElement, newElement, newElementMouseLeftDifference, newElementMouseTopDifference;
let isScrolling = false;

const smoothScroll = (scrollAmount, contentWrapper) => {
  if (scrollAmount <= 0 || !isScrolling)
    return;

  contentWrapper.scrollBy(0, 5);

  setTimeout(() => {
    smoothScroll(scrollAmount-1, contentWrapper);
  }, 15);
}

function mouseMoveListener (event) {
  newElement.style.left = (event.clientX - newElementMouseLeftDifference) + "px";
  newElement.style.top = (event.clientY - newElementMouseTopDifference) + "px";

  if (event.clientY + newElement.offsetHeight - newElementMouseTopDifference > window.innerHeight - 20) {
    if (!isScrolling) {
      isScrolling = true;
      smoothScroll(1000, dragAndDropElement.parentNode.parentNode);
    }
  } else {
    isScrolling = false;
  }

  if (dragAndDropElement.previousElementSibling && (event.clientY - newElementMouseTopDifference - 50) < dragAndDropElement.previousElementSibling.getBoundingClientRect().top) {
    dragAndDropElement.parentNode.insertBefore(dragAndDropElement, dragAndDropElement.previousElementSibling);
  }

  if (dragAndDropElement.nextElementSibling && (event.clientY - newElementMouseTopDifference + 50) > dragAndDropElement.nextElementSibling.getBoundingClientRect().top) {
    dragAndDropElement.parentNode.insertBefore(dragAndDropElement.nextElementSibling, dragAndDropElement);
  }
}

function dragAndDrop () {
  document.addEventListener('mousedown', event => {
    let isEventInsideDragAndDropWrapper = false; // Variable to check if the click is inside a drag and drop wrapper
    dragAndDropElement; // The upper most element inside the drag and drop wrapper
    let targetNode = event.target;

    while (targetNode.parentNode.nodeName != 'BODY' && !isEventInsideDragAndDropWrapper) {
      if (targetNode.parentNode.classList.contains('drag-and-drop-wrapper')) {
        isEventInsideDragAndDropWrapper = true;
        dragAndDropElement = targetNode;
      }
      targetNode = targetNode.parentNode;
    }

    if (isEventInsideDragAndDropWrapper) {
      dragAndDropElement.style.opacity = 0.3;

      newElement = duplicateElement(dragAndDropElement); // Duplicate the element to fallow mouse position
      newElementMouseLeftDifference = event.clientX - dragAndDropElement.getBoundingClientRect().left; // Difference of mouse position to wrapper left border
      newElementMouseTopDifference = event.clientY - dragAndDropElement.getBoundingClientRect().top; // Difference of mouse position to wrapper top border

      newElement.style.position = "absolute";

      document.querySelector('body').appendChild(newElement);

      document.addEventListener('mousemove', mouseMoveListener);

      document.addEventListener('mouseup', () => {
        isScrolling = false;
        document.removeEventListener('mousemove', mouseMoveListener);
        dragAndDropElement.style.opacity = 1;
        newElement.remove();
      });
    }
  });
}

window.addEventListener('load', () => {
  dragAndDrop();
});
