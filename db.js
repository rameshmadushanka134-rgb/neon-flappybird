class GameDatabase {
  constructor() {
    this.dbName = 'NeonFlappyDB';
    this.dbVersion = 1;
    this.db = null;

    this.useFirestore = false; // Maps to Realtime DB connection status
    this.rdb = null;           // Firebase Realtime DB instance
    this.firestoreConfig = null;

    // Default configuration to automatically connect to the user's Realtime cloud database
    this.defaultFirebaseConfig = {
      apiKey: "AIzaSyCC1379RayA0QSas9gzpmrYj1rv1nlG6RA",
      authDomain: "neon-flappy-bird.firebaseapp.com",
      databaseURL: "https://neon-flappy-bird-default-rtdb.firebaseio.com",
      projectId: "neon-flappy-bird",
      storageBucket: "neon-flappy-bird.firebasestorage.app",
      messagingSenderId: "24834651770",
      appId: "1:24834651770:web:756f2529b44ec3278e2dc3",
      measurementId: "G-DM9FZK5XSB"
    };

    // Auto-connect to Database if config exists in localStorage, otherwise use default config
    try {
      let storedConfig = localStorage.getItem('neon_flappy_firebase_config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        // Clear old config if databaseURL is missing (e.g. from prior Firestore setup attempt)
        if (!parsed.databaseURL) {
          localStorage.removeItem('neon_flappy_firebase_config');
          storedConfig = null;
        }
      }
      
      const config = storedConfig ? JSON.parse(storedConfig) : this.defaultFirebaseConfig;
      if (config) {
        // Wait a bit to ensure Firebase SDK scripts are loaded in the browser
        setTimeout(() => {
          this.initFirestore(config);
        }, 500);
      }
    } catch (e) {
      console.error("Failed to auto-init Database:", e);
    }
  }

  initFirestore(config) {
    if (typeof firebase === 'undefined') {
      console.warn("Firebase SDK is not loaded. Cannot use Database.");
      this.useFirestore = false;
      return false;
    }

    try {
      if (firebase.apps.length === 0) {
        firebase.initializeApp(config);
      }
      this.rdb = firebase.database();
      
      // Enable offline synchronization for Realtime Database
      this.rdb.ref('users').keepSynced(true);

      this.useFirestore = true;
      this.firestoreConfig = config;
      localStorage.setItem('neon_flappy_firebase_config', JSON.stringify(config));
      return true;
    } catch (e) {
      console.error("Failed to initialize Database:", e);
      this.useFirestore = false;
      return false;
    }
  }

  disconnectFirestore() {
    this.useFirestore = false;
    this.rdb = null;
    this.firestoreConfig = null;
    localStorage.removeItem('neon_flappy_firebase_config');
  }

  syncLocalToFirestore() {
    if (!this.useFirestore || !this.rdb) {
      return Promise.reject('Database is not connected.');
    }
    return this.getLocalAllUsers().then(localUsers => {
      const promises = localUsers.map(user => {
        return this.rdb.ref('users/' + user.username).set(user);
      });
      return Promise.all(promises);
    });
  }

  open() {
    return new Promise((resolve, reject) => {
      if (this.db) return resolve(this.db);

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB opened successfully.');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
          console.log('Object store "users" created.');
        }
      };
    });
  }

  // Get user profile (Cloud Realtime DB-first, Local-second)
  getUser(username) {
    if (this.useFirestore && this.rdb) {
      return this.rdb.ref('users/' + username).once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
          this.saveLocalUser(data);
          return data;
        } else {
          return null;
        }
      }).catch(err => {
        console.error("Realtime DB getUser failed, falling back to local DB:", err);
        return this.getLocalUser(username);
      });
    } else {
      return this.getLocalUser(username);
    }
  }

  getLocalUser(username) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.open().then(() => {
          this._getLocalUser(username).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        this._getLocalUser(username).then(resolve).catch(reject);
      }
    });
  }

  _getLocalUser(username) {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not opened.');
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(username);
      request.onsuccess = (event) => resolve(event.target.result || null);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Save user profile (Write to both local and Cloud Realtime DB)
  saveUser(user) {
    const localPromise = this.saveLocalUser(user);

    if (this.useFirestore && this.rdb) {
      return this.rdb.ref('users/' + user.username).set(user)
        .then(() => localPromise)
        .catch(err => {
          console.error("Realtime DB saveUser failed:", err);
          return localPromise;
        });
    } else {
      return localPromise;
    }
  }

  saveLocalUser(user) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.open().then(() => {
          this._saveLocalUser(user).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        this._saveLocalUser(user).then(resolve).catch(reject);
      }
    });
  }

  _saveLocalUser(user) {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not opened.');
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Get all users (Cloud Realtime DB-first, Local-second)
  getAllUsers() {
    if (this.useFirestore && this.rdb) {
      return this.rdb.ref('users').once('value').then(snapshot => {
        const data = snapshot.val() || {};
        const users = Object.values(data);
        users.forEach(user => {
          this.saveLocalUser(user); // Sync local copy
        });
        return users;
      }).catch(err => {
        console.error("Realtime DB getAllUsers failed, falling back to local DB:", err);
        return this.getLocalAllUsers();
      });
    } else {
      return this.getLocalAllUsers();
    }
  }

  getLocalAllUsers() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.open().then(() => {
          this._getLocalAllUsers().then(resolve).catch(reject);
        }).catch(reject);
      } else {
        this._getLocalAllUsers().then(resolve).catch(reject);
      }
    });
  }

  _getLocalAllUsers() {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not opened.');
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();
      request.onsuccess = (event) => resolve(event.target.result || []);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Delete user (Delete from both local and Cloud Realtime DB)
  deleteUser(username) {
    const localPromise = this.deleteLocalUser(username);

    if (this.useFirestore && this.rdb) {
      return this.rdb.ref('users/' + username).remove()
        .then(() => localPromise)
        .catch(err => {
          console.error("Realtime DB deleteUser failed:", err);
          return localPromise;
        });
    } else {
      return localPromise;
    }
  }

  deleteLocalUser(username) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.open().then(() => {
          this._deleteLocalUser(username).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        this._deleteLocalUser(username).then(resolve).catch(reject);
      }
    });
  }

  _deleteLocalUser(username) {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not opened.');
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(username);
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  }
}

// Expose globally
window.gameDB = new GameDatabase();
