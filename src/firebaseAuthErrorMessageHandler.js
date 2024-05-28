 export function getFirebaseAuthErrorMessage(errorCode) {
    const errorMessages = {
        "auth/invalid-credential": "Invalid email or password",
        'auth/user-disabled': 'This user has been disabled. Please contact support for help.',
        'auth/user-not-found': 'Please register.',
        'auth/wrong-password': 'Wrong email or password.',
        'auth/email-already-in-use': 'This email is already in use by another account.',
        'auth/weak-password': 'Please enter a stronger password.',
        'auth/too-many-requests': 'We have detected too many requests from your device. Please take a break then try again later.',
        'auth/account-exists-with-different-credential': 'An account already exists with the same email.',
        'auth/operation-not-supported-in-this-environment': 'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',
        'auth/timeout': 'The request to the Firebase Authentication server timed out. Please try again.',
        'auth/missing-android-pkg-name': 'An Android Package Name must be provided if the Android App is required to be installed.',
        'auth/invalid-continue-uri': 'The continue URL provided in the request is invalid.',
        'auth/unauthorized-continue-uri': 'The domain of the continue URL is not whitelisted. Please whitelist the domain in the Firebase console.',
        'auth/invalid-dynamic-link-domain': 'The dynamic link domain is not configured or authorized for the current project.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
