/* إعداد Firebase الخاص بغرف اللعب أونلاين.
   أنشئ مشروعًا في Firebase Console، وفعّل Authentication > Anonymous
   وRealtime Database، ثم استبدل القيم التجريبية بالقيم من إعدادات تطبيق الويب.
*/
window.GUESS_FLAGS_FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_DATABASE_NAME-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "PASTE_YOUR_FIREBASE_APP_ID_HERE"
};
