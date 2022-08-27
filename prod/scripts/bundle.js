document.addEventListener("DOMContentLoaded", ready);

let wrapper = document.querySelector('.wrapper');
let addNoteInput = document.querySelector('.add_note');
let addNoteButton = document.querySelector('.add_button');
let notesWrapper = document.querySelector('.notes_wrapper');
let lastNoteNumber = +localStorage.getItem('lastNoteNumber') || 0;
let removeCompletedTasksButton = document.querySelector('.remove_completed_tasks');

let notesCount = 0;

// Clicks	
document.addEventListener('click', (event) => {
	if (event.target.classList.contains('add_button')) {
		addNote();
	}

	if (event.target.classList.contains('complete_note')) {
		completeNote(event.target);
	}

	if (event.target.classList.contains('edit_note')) {
		editNote(event.target.previousElementSibling);
	}

	if (event.target.classList.contains('delete_note')) {
		deleteNote(event.target);
	}

	if (event.target.classList.contains('remove_completed_tasks')) {
		for (let note of notesWrapper.querySelectorAll('.complete_note[checked=true]')) {
			deleteNote(note);
		}
	}
});

// Button Enter
document.addEventListener('keydown', (event) => {
	if (event.code == 'Enter') {
		if (addNoteInput.value == '') return;
		addNote();
	}
});

// Add note on page
function addNote() {
	if (addNoteInput.value == '') return;

	lastNoteNumber += 1;
	notesCount += 1;

	let elem = document.createElement('li');
	elem.classList.add('note');
	elem.setAttribute('data-note-number', `note_${lastNoteNumber}`);
	elem.setAttribute('data-number', notesCount);
	elem.setAttribute('draggable', true);

	elem.innerHTML = `<input type="checkbox" name="complete_note" class="complete_note">
	<span class="text_note">${addNoteInput.value}</span>
	<a href="#" onclick="return false" class="edit_note"></a>
	<a href="#" onclick="return false" class="delete_note"></a>`;

	notesWrapper.append(elem);

	addNoteInput.value = '';
	addNoteInput.focus();

	addNoteToLocalstorage(elem);
	updateProgressBar();
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

	showDeleteAllButton();
	updateProgressBar();
};

// Delete note
function deleteNote(target) {
    
	let elem = target.closest('.note');
	let note_number = elem.dataset.noteNumber;
	elem.remove();
	localStorage.removeItem(note_number);

	changeDataNumbers()
	updateProgressBar();

	if (!document.querySelector('.complete_note[checked=true]')) {
		removeCompletedTasksButton.classList.add('hidden_element');
	}
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
    		updateProgressBar();
    	} else {
    		let elem = target.closest('.note');
    		let note_number = elem.dataset.noteNumber;
    		addNoteToLocalstorage(elem, note_number);
    	}
    });
};

// Change Data Numbers
function changeDataNumbers() {
	let notes = document.querySelectorAll('.note');

	let i = 1;
	for (let note of notes) {
		note.setAttribute('data-number', i);
		i++;

		let noteObj = {
			noteText: note.outerHTML
		}

		let note_number = note.getAttribute('data-note-number');
		localStorage.setItem(note_number, JSON.stringify(noteObj));
	}
};

// Sorting
function sorting() {
	[...notesWrapper.querySelectorAll('.note')]
	    .sort((a, b) => a.dataset.number - b.dataset.number)
	    .forEach(element => notesWrapper.append(element));
};

// DOMContentLoaded
function ready() {

	let arr = [];

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
	notesCount = arr.length;

	sorting();
	showDeleteAllButton();
	updateProgressBar();
};

// Update Progress Bar
function updateProgressBar() {
	let progressBar = document.querySelector('.progress_bar');
	let notesDone = document.querySelector('.notes_done');
	let notesTotal = document.querySelector('.notes_total');
	let progressStatus = document.querySelector('.progress_status');

	if ([...notesWrapper.querySelectorAll('.note')].length > 0) {
		notesDone.textContent = notesWrapper.querySelectorAll('.complete_note[checked=true]').length;
		notesTotal.textContent = notesWrapper.querySelectorAll('.note').length;
		
		if (progressBar.classList.contains('hidden_element')) {
			progressBar.classList.remove('hidden_element');
		}

		progressStatus.style.width = (notesDone.textContent/notesTotal.textContent)*100 + '%';
	} else {
		progressStatus.style.width = '0px';
		progressBar.classList.add('hidden_element');
	}
};

// Drag and drop
let notes = document.querySelectorAll('.note');

notesWrapper.addEventListener('mousedown', (event) => {

	if (!(event.target.classList.contains('note') ||
		event.target.classList.contains('text_note'))) {
		return;
	}

	let target = event.target.closest('.note');
	target.classList.add('selected');

	// Mousemove
	notesWrapper.addEventListener('mousemove', onMouseMove);

	function onMouseMove(event) {
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

		if (nextElement === null) {
			currentElement.after(activeElement);
		} else {
			nextElement.before(activeElement);
		}
	};

	// Mouseup
	notesWrapper.addEventListener('mouseup', (event) => {
		target.classList.remove('selected');
		notesWrapper.removeEventListener('mousemove', onMouseMove);
		changeDataNumbers();
	});
});

notesWrapper.ondragstart = function() {
  return false;
};

// Show/hide delete button
function showDeleteAllButton() {
	if (!document.querySelector('.complete_note[checked=true]')) {
		removeCompletedTasksButton.classList.add('hidden_element');
	} else {
		removeCompletedTasksButton.classList.remove('hidden_element')
	}
};

// Change background color
let backgroundColorInput = document.querySelector('.background_color');

backgroundColorInput.addEventListener('change', (event) => {
	document.body.style.backgroundColor = event.target.value;
})