//Variabel global
const bookList = [];
const STORAGE_KEY = 'PERSONAL_BOOKLIST'

//Mengambil data buku dari form
function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = parseInt(document.getElementById('bookFormYear').value);
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;
   
    const bookId = generateId();
    const bookItem = generateBookItem(bookId, bookTitle, bookAuthor, bookYear, bookIsComplete);
    bookList.push(bookItem);
   
    renderBooks(bookList);
    saveToStorage();

    // Tampilkan toast message
    showToast(`"${bookTitle}" berhasil ditambahkan!`);
}

//Memindahkan buku dari rak inComplete ke rak complete
function switchBookshelf(bookListId) {
    const bookTarget = findBook(bookListId);
    if (bookTarget == null) return;
    
    bookTarget.isComplete = !bookTarget.isComplete;
    renderBooks(bookList);
    saveToStorage();

    // Tampilkan toast message
    showToast(`"${bookTarget.title}" berhasil dipindahkan!`);
}

//Menghapus buku
function removeBook(bookListId) {
    const bookTarget = findBookIndex(bookListId);
    if (bookTarget == -1) return;

    // Tampilkan toast message
    showToast(`"${bookList[bookTarget].title}" berhasil dihapus!`);

    bookList.splice(bookTarget, 1);
    renderBooks(bookList);
    saveToStorage();
}

//Mengedit buku
function editBook(bookListId) {
    const bookTarget = findBook(bookListId);
    if (bookTarget == null) return;

    // Prompt untuk mengedit data buku
    const newTitle = prompt("Masukkan judul baru:", bookTarget.title);
    const newAuthor = prompt("Masukkan penulis baru:", bookTarget.author);
    const newYear = prompt("Masukkan tahun baru:", bookTarget.year);
    const newIsComplete = confirm(`Apakah buku ini sudah selesai dibaca?\n(OK untuk selesai, Cancel untuk belum)`);

    // Perbarui data buku jika ada perubahan
    if (newTitle !== null) bookTarget.title = newTitle;
    if (newAuthor !== null) bookTarget.author = newAuthor;
    if (newYear !== null && !isNaN(newYear)) bookTarget.year = parseInt(newYear);
    bookTarget.isComplete = newIsComplete;

    // Trigger render ulang
    renderBooks(bookList);
    saveToStorage();

    // Tampilkan toast message
    showToast(`"${newTitle}" berhasil diperbarui!`);
}



//Menyimpan data ke local storage
function saveToStorage() {
    if (isStorageExist()) {
        const stringified = JSON.stringify(bookList);
        localStorage.setItem(STORAGE_KEY, stringified);
    }
}

//Mengecek kompabilitas web storage
function isStorageExist() {
    if (typeof(Storage) == undefined) {
        alert('Browser ini tidak mendukung web storage. Data akan terhapus setelah anda keluar dari laman ini.');
        return false;
    } else {
        return true;
    }
} 

//Menampilkan previous session data
function loadDataFromStorage() {
    const preSessionData = localStorage.getItem(STORAGE_KEY);
    let parsed = JSON.parse(preSessionData);
   
    if (parsed !== null) {
      for (const bookItem of parsed) {
        bookList.push(bookItem);
      }
    }
   
    renderBooks(bookList);
  }

//Membuat ID unik
function generateId() {
    return Number(new Date());
}

//Mengkonversi data buku ke Object
function generateBookItem(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
}

//Mengkonversi bookList menjadi elemen HTML
function makeBookList(bookList) {
    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = bookList.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = `Penulis: ${bookList.author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = `Tahun: ${bookList.year}`;

    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookList.id);
    container.setAttribute('data-testid', 'bookItem');

    const switchButton = document.createElement('button');
    switchButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    switchButton.setAttribute('title', bookList.isComplete ? 'Pindahkan ke Rak Belum Selesai' : 'Pindahkan ke Rak Selesai');
    switchButton.addEventListener('click', () => switchBookshelf(bookList.id));

    if (bookList.isComplete) { 
        switchButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
    } else {  
        switchButton.innerHTML = '<span class="material-symbols-outlined">check_circle</span>';
    }

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.setAttribute('title', 'Hapus Buku');
    deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus buku "${bookList.title}"?`);
        if (confirmDelete) removeBook(bookList.id);
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.setAttribute('title', 'Edit Buku');
    editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    editButton.addEventListener('click', () => editBook(bookList.id));

    const buttonContainer = document.createElement('div');
    buttonContainer.append(switchButton, deleteButton, editButton);
    container.append(bookTitle, bookAuthor, bookYear, buttonContainer);

    return [container, bookList.isComplete];
}


//Mencari data dari suatu buku
function findBook(bookListId) {
    for (const bookItem of bookList) {
      if (bookItem.id === bookListId) {
        return bookItem;
      }
    }
    return null;
}

//Mencari indeks ke berapakah suatu buku
function findBookIndex(bookListId) {
    for (const bookIndex in bookList) {
        if (bookList[bookIndex].id == bookListId) {
            return bookIndex;
        }
    }
    return -1;
}

// Fungsi untuk menangani pencarian buku
function searchBook(event) {
    event.preventDefault();
    
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = bookList.filter(bookItem => 
        bookItem.title.toLowerCase().includes(searchTitle)
    );
    
    renderBooks(filteredBooks); 
}

// Fungsi untuk merender buku (baik hasil pencarian atau seluruh buku)
function renderBooks(books) {
    const completeBookList = document.getElementById('completeBookList');
    const incompleteBookList = document.getElementById('incompleteBookList');
    completeBookList.innerHTML = '';
    incompleteBookList.innerHTML = '';

    let hasIncompleteBooks = false;
    let hasCompleteBooks = false;

    for (const bookItem of books) {
        const bookElement = makeBookList(bookItem);

        if (bookElement[1]) {
            completeBookList.append(bookElement[0]);
            hasCompleteBooks = true;
        } else {
            incompleteBookList.append(bookElement[0]);
            hasIncompleteBooks = true;
        }
    }

    // Tampilkan pesan jika rak buku kosong
    if (!hasIncompleteBooks) {
        const emptyMessage = document.createElement('p');
        emptyMessage.setAttribute('data-testid', 'emptyIncompleteMessage');
        emptyMessage.innerText = 'Data tidak ditemukan.';
        incompleteBookList.append(emptyMessage);
    }

    if (!hasCompleteBooks) {
        const emptyMessage = document.createElement('p');
        emptyMessage.setAttribute('data-testid', 'emptyCompleteMessage');
        emptyMessage.innerText = 'Belum ada buku yang selesai dibaca.';
        completeBookList.append(emptyMessage);
    }
}

//Fungsi toast message
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    toastContainer.appendChild(toast);

    // Tampilkan toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hapus toast setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // Beri waktu untuk animasi keluar
    }, 3000);
}

//Event listener onSubmit dan pemanggilan loadDataFromStorage()
document.addEventListener('DOMContentLoaded', function () {
    const bookFormSubmit = document.getElementById('bookForm');
    bookFormSubmit.addEventListener('submit', function (event) {
        event.preventDefault(); //Pada defaultnya setiap kali onSubmit halaman akan ter-refresh, nah Method ini akan membatalkannya
        addBook();
        event.target.reset(); //Me-reset target event, yaitu form
    });

    //Menambahkan event listener pada form pencarian
    const searchBookSubmit = document.getElementById('searchBook');
    searchBookSubmit.addEventListener('submit', searchBook);

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});