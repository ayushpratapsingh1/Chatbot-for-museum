import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMk4OuBRvQr8JBAiq0LU2d79UJ370dI0g",
    authDomain: "chat-952cb.firebaseapp.com",
    projectId: "chat-952cb",
    storageBucket: "chat-952cb.appspot.com",
    messagingSenderId: "195902439311",
    appId: "1:195902439311:web:c9d0e55c7900ffcf0395fa",
    measurementId: "G-KMEEZTGLXK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = {
  Maharashtra: {
    districts: {
      Mumbai: {
        museums: [
          'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya',
          'Dr. Bhau Daji Lad Mumbai City Museum'
        ]
      },
      Pune: {
        museums: [
          'Raja Dinkar Kelkar Museum',
          'National War Museum'
        ]
      }
    }
  },
  'Uttar Pradesh': {
    districts: {
      Agra: {
        museums: [
          'Taj Museum',
          'Agra Art Gallery'
        ]
      },
      Lucknow: {
        museums: [
          'State Museum Lucknow',
          '1857 Memorial Museum'
        ]
      }
    }
  },
  Punjab: {
    districts: {
      Amritsar: {
        museums: [
          'Partition Museum',
          'Maharaja Ranjit Singh Museum'
        ]
      },
      Patiala: {
        museums: [
          'Sheesh Mahal',
          'Qila Mubarak'
        ]
      }
    }
  }
};

async function populateFirestore() {
  for (const [state, stateData] of Object.entries(data)) {
    const stateRef = doc(db, 'states', state);
    await setDoc(stateRef, {});

    for (const [district, districtData] of Object.entries(stateData.districts)) {
      const districtRef = doc(stateRef, 'districts', district);
      await setDoc(districtRef, { name: district });

      for (const museum of districtData.museums) {
        const museumRef = doc(districtRef, 'museums', museum);
        await setDoc(museumRef, { name: museum });
      }
    }
  }
  console.log('Database populated successfully');
}

populateFirestore().catch(console.error);