document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    
    if (accessToken === null) {
        alert('Access invalid.');
        window.location.href = '../';
        return;
    }

    const notesList = document.getElementById('notesList');
    const noteHeader = document.getElementById('noteHeader');
    const noteContent = document.getElementById('noteContent');
    const newNoteButton = document.getElementById('newNoteButton');
    const deleteButton = document.getElementById('deleteButton');
    const isiNotes = document.querySelector('.isi-notes');
    const blankHeader = document.querySelector('.blank-header');

    let typingTimer;
    const doneTypingInterval = 2000;
    
    newNoteButton.addEventListener('click', createNote);
    deleteButton.addEventListener('click', deleteCurrentNote);
    notesList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            setActiveNote(e.target.dataset.id);
            renderNotesList();
        }
    });
    noteContent.addEventListener('input', (e) => {
        updateNoteContent(e.target.value);
    });
    noteHeader.addEventListener('input', (e) => {
        const maxLength = 12; // Jumlah maksimum huruf yang diizinkan
        if (e.target.value.length > maxLength) {
            e.target.value = e.target.value.slice(0, maxLength); // Menghapus karakter yang melebihi batas
        }
        updateNoteTitle(e.target.value);
    });

    let activeNoteId = null;
    let notes = await getNotesFromDB();
    
    if (notes.length > 0) { 
        setActiveNote(notes[0].id);
        renderNotesList();
    }

    async function getNotesFromDB() {
        const response = await fetch('/api/notes', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const notes = await response.json();
        return notes.sort((a, b) => a.id - b.id);
    }

    function renderNotesList() {
        notesList.innerHTML = '';
        notes.forEach(note => {
            const noteItem = document.createElement('li');
            noteItem.textContent = note.title;
            noteItem.dataset.id = note.id;
            if (note.id === activeNoteId) {
                noteItem.classList.add('active');
            }

            notesList.appendChild(noteItem);
        });

        if (notes.length === 0) {
            isiNotes.style.display = 'none';
            blankHeader.style.display = 'none';
        } else {
            isiNotes.style.display = 'block';
            blankHeader.style.display = 'flex';
        }
    }

    async function postNoteToDB(note) {
        await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(note)
        });
    }

    async function createNote() {
        const id = Date.now().toString();
        const newNote = { id: id, title: '', content: '' };
        notes.push(newNote);
        setActiveNote(id)
        renderNotesList();

        await postNoteToDB(newNote);
    }

    function setActiveNote(id) {
        activeNoteId = id;
        const note = notes.find(note => note.id === id);
        if (note) {
            noteHeader.value = note.title;
            noteContent.value = note.content;
        }
    }

    async function putNoteToDB(note) {
        await fetch(`/api/notes/${note.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(note)
        });
    }

    async function updateNoteContent(content) {
        const note = notes.find(note => note.id === activeNoteId);
        if (note) {
            note.content = content;
            renderNotesList();

            clearTimeout(typingTimer);

            typingTimer = setTimeout(async () => {
                await putNoteToDB(note);
            }, doneTypingInterval);
        }
    }
    
    async function updateNoteTitle(title) {
        const note = notes.find(note => note.id === activeNoteId);
        if (note) {
            note.title = title;
            renderNotesList();

            clearTimeout(typingTimer);

            typingTimer = setTimeout(async () => {
                await putNoteToDB(note);
            }, doneTypingInterval);
        }
    }
    
    async function deleteNoteFromDB(note) {
        await fetch(`/api/notes/${note.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    }

    async function deleteCurrentNote() {
        if (activeNoteId !== null) {
            const note = notes.find(note => note.id === activeNoteId);
            notes = notes.filter(note => note.id !== activeNoteId);
            activeNoteId = null;
            renderNotesList();
            blankHeader.style.display = 'none';
            isiNotes.style.display = 'none';

            await deleteNoteFromDB(note);
        }
    }
});
