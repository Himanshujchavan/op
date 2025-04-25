import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore"
import { toast } from "@/components/ui/use-toast"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Global variables
let app
let auth
let db
let isFirestoreInitialized = false
let isOffline = false

// Initialize Firebase only if it hasn't been initialized yet
// and we have the required configuration
if (!getApps().length && firebaseConfig.apiKey) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig)

    // Initialize Auth
    auth = getAuth(app)

    // Set auth persistence
    if (typeof window !== "undefined") {
      setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("Auth persistence enabled"))
        .catch((error) => console.error("Error enabling auth persistence:", error))
    }

    // Initialize Firestore
    db = getFirestore(app)
    isFirestoreInitialized = true

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
} else if (getApps().length) {
  // If Firebase is already initialized, get the instances
  app = getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  isFirestoreInitialized = true
}

// Separate function to enable Firestore persistence
// This should only be called client-side and only once
export const enableFirestorePersistence = () => {
  // Only run on client and only if Firestore is initialized
  if (typeof window === "undefined" || !db) return

  // Use a flag in localStorage to ensure we only try once per session
  const persistenceAttempted = localStorage.getItem("firestorePersistenceAttempted")

  if (persistenceAttempted !== "true") {
    localStorage.setItem("firestorePersistenceAttempted", "true")

    try {
      enableIndexedDbPersistence(db)
        .then(() => {
          console.log("Firestore persistence enabled successfully")
        })
        .catch((err) => {
          if (err.code === "failed-precondition") {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
          } else if (err.code === "unimplemented") {
            console.warn("The current browser doesn't support all of the features required to enable persistence")
          } else {
            console.error("Error enabling Firestore persistence:", err)
          }
        })
    } catch (error) {
      console.error("Exception when attempting to enable persistence:", error)
    }
  }
}

// Function to check network status and update Firestore connection
export const checkNetworkStatus = async () => {
  if (typeof navigator === "undefined") return true // SSR check

  if (!navigator.onLine && !isOffline) {
    isOffline = true
    if (db) {
      try {
        await disableNetwork(db)
        console.log("Firestore network disabled due to offline status")
      } catch (error) {
        console.error("Error disabling Firestore network:", error)
      }
    }
    return false
  } else if (navigator.onLine && isOffline) {
    isOffline = false
    if (db) {
      try {
        await enableNetwork(db)
        console.log("Firestore network re-enabled")
      } catch (error) {
        console.error("Error enabling Firestore network:", error)
      }
    }
    return true
  }
  return navigator.onLine
}

// Add event listeners for online/offline status if in browser environment
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    checkNetworkStatus()
    toast({
      title: "You're back online",
      description: "Connection restored. All features are now available.",
    })
  })

  window.addEventListener("offline", () => {
    checkNetworkStatus()
    toast({
      title: "You're offline",
      description: "Some features may be limited until connection is restored.",
      variant: "destructive",
    })
  })

  // Set initial offline state
  isOffline = !navigator.onLine
}

export { auth, db, isFirestoreInitialized }

// Create a default user profile object
const createDefaultUserProfile = (user, email) => {
  return {
    email: user.email,
    name: user.displayName || email.split("@")[0],
    role: "User",
    emailVerified: user.emailVerified,
    createdAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp for client-side
    preferences: {
      notifications: true,
      soundEffects: true,
      animations: true,
      theme: "light",
    },
  }
}

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Check if Firebase auth is initialized
    if (!auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured. Please add your Firebase credentials.",
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with name
    await updateProfile(user, {
      displayName: name,
    })

    // Send email verification - make sure this is called
    await sendEmailVerification(user)
    console.log("Verification email sent to:", email)

    // Create user document in Firestore
    if (db) {
      try {
        // Check network status before attempting Firestore operations
        const isOnline = await checkNetworkStatus()
        if (!isOnline) {
          console.warn("Creating user document failed: Device is offline")
          return {
            success: true,
            user,
            warning:
              "User created but profile data couldn't be saved because you're offline. Some features may be limited.",
          }
        }

        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          role: "User",
          emailVerified: false,
          createdAt: serverTimestamp(),
          preferences: {
            notifications: true,
            soundEffects: true,
            animations: true,
            theme: "light",
          },
        })
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError)
        return {
          success: true,
          user,
          warning: "User created but profile data couldn't be saved. Some features may be limited.",
        }
      }
    }

    return { success: true, user }
  } catch (error: any) {
    console.error("Error signing up:", error)
    return { success: false, error: error.message }
  }
}

// Modify the signIn function to better handle permission errors
export const signIn = async (email: string, password: string) => {
  try {
    // Check if Firebase auth is initialized
    if (!auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured. Please add your Firebase credentials.",
      }
    }

    // Check if offline before attempting to sign in
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true

    // For testing purposes, log the authentication attempt
    console.log(`Attempting to sign in with email: ${email}, online status: ${isOnline}`)

    // Proceed with authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("Sign in successful for user:", user.uid)

    // Create basic user data if offline
    if (!isOnline) {
      console.log("User is offline, skipping Firestore operations")
      return {
        success: true,
        user,
        offlineMode: true,
        userData: createDefaultUserProfile(user, email),
        warning: "You're offline. Some features may be limited until connection is restored.",
      }
    }

    // Get user data from Firestore if online
    if (db) {
      try {
        // Wait a moment for auth state to fully establish
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          return { success: true, user, userData }
        } else {
          console.warn("User document does not exist in Firestore")
          // Create a basic user document if it doesn't exist
          try {
            const basicUserData = createDefaultUserProfile(user, email)

            // Use serverTimestamp for Firestore
            const firestoreData = {
              ...basicUserData,
              createdAt: serverTimestamp(),
            }

            try {
              await setDoc(doc(db, "users", user.uid), firestoreData)
              console.log("Created missing user document")
              return { success: true, user, userData: basicUserData }
            } catch (permissionError) {
              console.error("Permission error creating user document:", permissionError)
              // Return success with the basic user data even if we couldn't save to Firestore
              return {
                success: true,
                user,
                userData: basicUserData,
                warning:
                  "Authentication successful, but user data couldn't be saved due to permission issues. Some features may be limited.",
              }
            }
          } catch (createError) {
            console.error("Error creating missing user document:", createError)
            return {
              success: true,
              user,
              userData: createDefaultUserProfile(user, email),
              warning: "Authentication successful, but user data couldn't be created. Some features may be limited.",
            }
          }
        }
      } catch (firestoreError) {
        console.error("Error fetching user data:", firestoreError)

        // Check if the error is due to being offline
        if (firestoreError.message && firestoreError.message.includes("offline")) {
          return {
            success: true,
            user,
            offlineMode: true,
            userData: createDefaultUserProfile(user, email),
            warning: "You're offline. Some features may be limited until connection is restored.",
          }
        }

        // Check for permission errors
        if (
          firestoreError.message &&
          (firestoreError.message.includes("permission") ||
            firestoreError.message.includes("insufficient") ||
            firestoreError.code === "permission-denied")
        ) {
          console.warn("Permission error when fetching user data. Using default profile.")
          return {
            success: true,
            user,
            userData: createDefaultUserProfile(user, email),
            warning:
              "Authentication successful, but couldn't access user data due to permission settings. Using default profile.",
          }
        }

        // Still return success since authentication worked
        return {
          success: true,
          user,
          userData: createDefaultUserProfile(user, email),
          warning: "Authentication successful, but user data couldn't be loaded. Some features may be limited.",
        }
      }
    }

    // If we get here, we don't have Firestore but authentication worked
    return {
      success: true,
      user,
      userData: createDefaultUserProfile(user, email),
    }
  } catch (error: any) {
    console.error("Error signing in:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)

    // Special handling for offline errors
    if (
      error.code === "auth/network-request-failed" ||
      error.message.includes("network") ||
      error.message.includes("offline")
    ) {
      return {
        success: false,
        error: "auth/network-request-failed",
        message: "You appear to be offline. Please check your connection and try again.",
      }
    }

    // Return the specific error code for better handling
    return {
      success: false,
      error: error.code || error.message,
    }
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return { success: false, error: error.message }
  }
}

export const logOut = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("Error signing out:", error)
    return { success: false, error: error.message }
  }
}

export const deleteAccount = async (password: string) => {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("No user is currently signed in")
    }

    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)

    // Delete user data from Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, "users", user.uid))
      } catch (firestoreError) {
        console.error("Error deleting user data:", firestoreError)
        // Continue with account deletion even if Firestore deletion fails
      }
    }

    // Delete user account
    await deleteUser(user)

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return { success: false, error: error.message }
  }
}

// User data functions
export const updateUserProfile = async (userId: string, data: any) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Profile updates will be available when you're back online.",
      }
    }

    await updateDoc(doc(db, "users", userId), data)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }
}

export const updateUserPreferences = async (userId: string, preferences: any) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Preference updates will be available when you're back online.",
      }
    }

    // Ensure theme is never undefined
    const updatedPreferences = {
      ...preferences,
      theme: preferences.theme || "light", // Provide a default if theme is undefined
    }

    await updateDoc(doc(db, "users", userId), { preferences: updatedPreferences })
    return { success: true }
  } catch (error: any) {
    console.error("Error updating preferences:", error)
    return { success: false, error: error.message }
  }
}

// Service connection functions
export const connectService = async (userId: string, service: string, connectionData: any) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Service connections will be available when you're back online.",
      }
    }

    // Get current connections
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data() || {}
    const connections = userData.connections || {}

    // Update connections
    connections[service] = {
      ...connectionData,
      connected: true,
      connectedAt: serverTimestamp(),
    }

    // Update user document
    await updateDoc(doc(db, "users", userId), { connections })

    return { success: true }
  } catch (error: any) {
    console.error(`Error connecting ${service}:`, error)
    return { success: false, error: error.message }
  }
}

export const disconnectService = async (userId: string, service: string) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Service disconnections will be available when you're back online.",
      }
    }

    // Get current connections
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data() || {}
    const connections = userData.connections || {}

    if (connections[service]) {
      // Update connection status
      connections[service] = {
        ...connections[service],
        connected: false,
        disconnectedAt: serverTimestamp(),
      }

      // Update user document
      await updateDoc(doc(db, "users", userId), { connections })
    }

    return { success: true }
  } catch (error: any) {
    console.error(`Error disconnecting ${service}:`, error)
    return { success: false, error: error.message }
  }
}

// Task functions with offline support
export const addTask = async (userId: string, taskData: any) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Task creation will be available when you're back online.",
      }
    }

    const taskRef = await addDoc(collection(db, "users", userId, "tasks"), {
      ...taskData,
      createdAt: serverTimestamp(),
      completed: false,
    })

    return { success: true, taskId: taskRef.id }
  } catch (error: any) {
    console.error("Error adding task:", error)
    return { success: false, error: error.message }
  }
}

export const updateTask = async (userId: string, taskId: string, taskData: any) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Task updates will be available when you're back online.",
      }
    }

    await updateDoc(doc(db, "users", userId, "tasks", taskId), {
      ...taskData,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error updating task:", error)
    return { success: false, error: error.message }
  }
}

export const deleteTask = async (userId: string, taskId: string) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      return {
        success: false,
        error: "You're offline. Task deletion will be available when you're back online.",
      }
    }

    await deleteDoc(doc(db, "users", userId, "tasks", taskId))
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting task:", error)
    return { success: false, error: error.message }
  }
}

export const getUserTasks = async (userId: string) => {
  try {
    // Check network status before attempting Firestore operations
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      // Return empty tasks array when offline
      console.warn("Fetching tasks failed: Device is offline")
      return {
        success: true,
        tasks: [],
        warning: "You're offline. Tasks will be loaded when you're back online.",
      }
    }

    const tasksQuery = query(collection(db, "users", userId, "tasks"), orderBy("createdAt", "desc"))

    const taskDocs = await getDocs(tasksQuery)
    const tasks = taskDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, tasks }
  } catch (error: any) {
    console.error("Error getting tasks:", error)
    return { success: false, error: error.message, tasks: [] }
  }
}

// Helper function to handle Firebase errors
export const handleFirebaseError = (error: any) => {
  let message = "An error occurred. Please try again."

  if (error.code) {
    switch (error.code) {
      case "auth/email-already-in-use":
        message = "This email is already in use."
        break
      case "auth/invalid-email":
        message = "Invalid email address."
        break
      case "auth/user-not-found":
        message = "No account found with this email."
        break
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Invalid email or password."
        break
      case "auth/weak-password":
        message = "Password is too weak."
        break
      case "auth/network-request-failed":
        message = "Network error. Please check your connection."
        break
      case "permission-denied":
        message = "Permission denied. Please check your Firebase security rules."
        break
      case "unavailable":
      case "failed-precondition":
        message = "You appear to be offline. Please check your connection."
        break
      default:
        message = error.message || message
    }
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  })

  return message
}

export const checkEmailVerified = async () => {
  try {
    if (!auth.currentUser) {
      return { verified: false }
    }

    // Force refresh the token to get the latest emailVerified status
    await auth.currentUser.reload()

    return {
      verified: auth.currentUser.emailVerified,
      user: auth.currentUser,
    }
  } catch (error: any) {
    console.error("Error checking email verification:", error)
    return { verified: false, error: error.message }
  }
}
