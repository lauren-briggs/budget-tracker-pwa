const request = indexedDB.open("budget", 1);

let db;


request.onsuccess = event => {
    db = event.request.result;
    console.log(`onSuccess: ${db}`);

    if (navigator.onLine) {
        checkDB();
    }
};

request.onupgradeneeded = event => {
    db = event.target.result;
    const transactionStore = db.createObjectStore("pendingTransaction", { keyPath: "id" }, { autoIncrement: true });
    console.log(transactionStore);
};

request.onsuccess = () => {
    db = request.result;

}

request.onerror = event => {
    console.log(event.target.errorCode);
}

function saveRecord(data) {
    const transaction = db.transaction(["pendingTransaction"], "readwrite");
    const transactionStore = transaction.objectStore("pendingTransaction");

    transactionStore.add(data)
}

function checkDB() {
    const transaction = db.transaction(["pendingTransaction", "readonly"]);
    const transactionStore = transaction.objectStore("pendingTransaction");
    const getAll = transactionStore.getAll();

    getAll.onsuccess = () => {
        console.log(getAll.result)
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(() => {
                const transaction = db.transaction(["pendingTransaction"], "readwrite");
                const transactionStore = transaction.objectStore("pendingTransaction");
                transactionStore.clear();
            })

        }
    }
}



function deletePending() {
    const transaction = db.transaction(["pendingTransaction"], "readwrite");
    const transactionStore = transaction.objectStore("pendingTransaction");
    transactionStore.clear();
}

// listen for app coming back online
window.addEventListener("online", checkDB);