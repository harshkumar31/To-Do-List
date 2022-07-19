        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
        import { doc, collection, setDoc, deleteDoc, getDoc, getFirestore, onSnapshot } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";

        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries
    
        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
        apiKey: "AIzaSyDJi3cELf7kQFgZpR3gHcf-PtaRrxtYtKw",
        authDomain: "to-do-js-8d6d4.firebaseapp.com",
        projectId: "to-do-js-8d6d4",
        storageBucket: "to-do-js-8d6d4.appspot.com",
        messagingSenderId: "846608875080",
        appId: "1:846608875080:web:7e5c5535e97e77c2d0e27d",
        measurementId: "G-2GZ29P0QVX"
        };
    
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        onAuthStateChanged(auth, (user) => {
            if(user)
            {
                console.log("User is signed in at users.html");
            }
            else
            {
                alert('Your login session has expired');
                location = "login.html";
            }
        });

        const userRef = collection(db,'users');
        onAuthStateChanged(auth, (user) => {
            const username = document.getElementById('username');
            if(user)
            {
                
                const docRef = doc(userRef,user.uid);

                getDoc(docRef).then(docSnap => {
                    if(docSnap.exists())
                    {
                        username.innerText = docSnap.data().Name;
                    }
                    else
                    {
                        console.log("no such doc");
                    }
                })
            }
            else
            {
                alert('Your login session has expired');
                location = "login.html";
            }
        });

        // adding todos to firestore database
        const form = document.getElementById('form');
        let date = new Date();
        let time = date.getTime();
        let counter = time;
        form.addEventListener('submit', e => {
            e.preventDefault();
            const todos = form['todos'].value;
            // console.log(todos);
            let id = counter += 1;
            form.reset();
            onAuthStateChanged(auth , (user) => {
                if (user) {
                    const userIDref = collection(db,user.uid);
                    setDoc(doc(userIDref,'_'+id),{
                        id: '_' + id,
                        todos
                    }).then(() => {
                        console.log('todo added');
                    }).catch(err => {
                        console.log(err.message);
                    });
                }
            })
        })

        const logout = document.getElementById("logout");
        logout.addEventListener('click', () => 
        {
            signOut(auth).then(() =>
            {
                console.log("user signed out");
            })
            .catch((err) => {
                console.log(err.message)
            })
        })


        function renderData(individualDoc) {
            // parent div
            let parentDiv = document.createElement("div");
            parentDiv.className = "container todo-box";
            parentDiv.setAttribute('data-id', individualDoc.id);
        
            // todo div
            let todoDiv = document.createElement("div");
            todoDiv.textContent = individualDoc.data().todos;
        
            // button
            let trash = document.createElement("button");
        
            let i = document.createElement("i");
            i.className = "fas fa-trash";
        
            // appending
            trash.appendChild(i);
        
            parentDiv.appendChild(todoDiv);
            parentDiv.appendChild(trash);

            todoContainer.appendChild(parentDiv);
        
            // trash clicking event
            trash.addEventListener('click', e => {
                let id = e.target.parentElement.parentElement.getAttribute('data-id');
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        const idRef = doc(db,user.uid,id);
                        deleteDoc(idRef).then(() => {});
                        //fs.collection(user.uid).doc(id).delete();
                    }
                })
            })
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userIDref = collection(db,user.uid);
                onSnapshot(userIDref, (snapshot) => {
                    let changes = snapshot.docChanges();
                    changes.forEach(change => {
                        if (change.type == "added") {
                            renderData(change.doc);
                        }
                        else if (change.type == 'removed') {
                            let li = todoContainer.querySelector('[data-id=' + change.doc.id + ']');
                            todoContainer.removeChild(li);
                        }
                    })
                })
            }
        });