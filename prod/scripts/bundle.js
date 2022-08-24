document.addEventListener("DOMContentLoaded", ready);

let wrapper = document.querySelector('.wrapper');

let notesWrapper = document.createElement('ul');
notesWrapper.classList.add('notes_wrapper');
wrapper.append(notesWrapper);

let note = document.querySelector('.add_note');
let addNoteButton = document.querySelector('.add_button');
let lastNoteNumber = +localStorage.getItem('lastNoteNumber') || 0;
	
document.addEventListener('click', (event) => {
	if (event.target.classList.contains('add_button')) {
		addNote();
	}

	if (event.target.classList.contains('complete_note')) {
		completeNote(event.target);
	}

	if (event.target.classList.contains('text_note')) {
		editNote(event.target);
	}

	if (event.target.classList.contains('edit_note')) {
		editNote(event.target.previousElementSibling);
	}

	if (event.target.classList.contains('delete_note')) {
		deleteNote(event.target);
		return false;
	}
});

// Button Enter
document.addEventListener('keydown', (event) => {
	if (event.code == 'Enter') {
		if (note.value == '') return;
		addNote();
	}
});

// Add note on page
function addNote() {
	if (note.value == '') return;

	lastNoteNumber += 1;
	let elem = document.createElement('li');
	elem.classList.add('note');
	elem.setAttribute('data-note-number', `note_${lastNoteNumber}`);
	elem.setAttribute('data-date', +(new Date()));
	elem.setAttribute('draggable', true);
	elem.innerHTML = `<input type="checkbox" name="complete_note" class="complete_note">
	<span class="text_note">${note.value}</span>
	<a href="#" onclick="return false" class="edit_note"></a>
	<a href="#" onclick="return false" class="delete_note"></a>`;

	notesWrapper.append(elem);

	note.value = '';
	note.focus();

	addNoteToLocalstorage(elem);
};

// Add note on localstorage
function addNoteToLocalstorage(elem, number) {
	let noteObj = {
		noteText: elem.outerHTML
	}

	if (number) {
		localStorage.setItem(number, JSON.stringify(noteObj));
	} else {
		localStorage.setItem('lastNoteNumber', lastNoteNumber);
		localStorage.setItem(`note_${lastNoteNumber}`, JSON.stringify(noteObj));
	}
};

// Complete note
function completeNote(target) {
	target.hasAttribute('checked') ? target.removeAttribute('checked') : target.setAttribute('checked', true);
	let parent = target.closest('.note');
	let elem = parent.querySelector('.text_note');
	let note_number = parent.dataset.noteNumber;

	elem.classList.toggle('note_complete');
		
	let noteObj = {
		noteText: parent.outerHTML
	}

	localStorage.setItem(note_number, JSON.stringify(noteObj));
};

// Delete note
function deleteNote(target) {
	let elem = target.closest('.note');
	let note_number = elem.dataset.noteNumber;
	elem.remove();
	localStorage.removeItem(note_number);
};

// Edit note
function editNote(target) {
	let targetHeight = getComputedStyle(target).height;

	let textarea = document.createElement('textarea');
	textarea.className = 'textarea_edit';
    textarea.value = target.innerHTML;
    textarea.style.height = targetHeight;
    target.replaceWith(textarea);
    textarea.focus();

    textarea.addEventListener('blur', () => {
    	target.textContent = textarea.value;
    	textarea.replaceWith(target);

    	if (textarea.value == '') {
    		deleteNote(target);
    	} else {
    		let elem = target.closest('.note');
    		let note_number = elem.dataset.noteNumber;
    		addNoteToLocalstorage(elem, note_number);
    	}
    });
};

// Sorting by
function sortingBy() {
	[...notesWrapper.querySelectorAll('.note')]
	    .sort((a, b) => a.dataset.date - b.dataset.date)
	    .forEach(element => notesWrapper.append(element));
}

// DOMContentLoaded
function ready() {

	let arr = [];
	let sortBy = null;

	for(let key in localStorage) {

		if (!localStorage.hasOwnProperty(key)) {
			continue;
		}

		if (key == 'sortBy') {
			sortBy = localStorage.getItem('sortBy');
			continue;
		}

		if (!key.startsWith('note_')) {
			continue;
		}

		let localNoteParams = JSON.parse(localStorage.getItem(key));
		arr.push(localNoteParams.noteText);
	};
	
	notesWrapper.innerHTML = arr.join('');
	console.log(sortBy)

	sortingBy(sortBy);
};


// Drag and drop
let notes = document.querySelectorAll('.note');

notesWrapper.addEventListener('dragstart', (event) => {
	event.target.classList.add('selected');
});

notesWrapper.addEventListener('dragend', (event) => {
	event.target.classList.remove('selected');
});

// function getNextElement(cursorPosition, currentElement) {
// // const getNextElement = (cursorPosition, currentElement) => {
// 	let currentElementCoord = currentElement.getBoundingClientRect()
// 	let currentElementCenter = currentElementCoord.top + currentElementCoord.height / 2;

// 	let nextElement = (cursorPosition < currentElementCenter) ?
// 		currentElement : currentElement.nextElementSibling;

// 	return nextElement;
// }

notesWrapper.addEventListener('dragover', (event) => {
	event.preventDefault();

	let activeElement = notesWrapper.querySelector('.selected');
	let currentElement = event.target;
	let isMoveable = activeElement !== currentElement &&
    currentElement.classList.contains('note');

	if (!isMoveable) {
		return;
	}

	let nextElement = (currentElement === activeElement.nextElementSibling) ?
		currentElement.nextElementSibling :
		currentElement;

	if (nextElement &&
		activeElement === nextElement.previousElementSibling ||
		activeElement === nextElement
	) {
		return;
	}

	nextElement.before(activeElement);
});