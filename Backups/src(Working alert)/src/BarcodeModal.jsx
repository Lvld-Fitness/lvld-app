import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function BarcodeModal({ onClose }) {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = getAuth().currentUser;
  const storage = getStorage();
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const fetchBarcodes = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBarcodes(data.barcodes || []);
      }
    };
    fetchBarcodes();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || barcodes.length >= 3) return;

    setLoading(true);

    const storageRef = ref(storage, `barcodes/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      barcodes: arrayUnion(downloadURL),
    });

    setBarcodes((prev) => [...prev, downloadURL]);
    setLoading(false);
  };

  const deleteBarcode = async (url) => {
    if (!user) return;
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      barcodes: arrayRemove(url),
    });

    setBarcodes((prev) => prev.filter((b) => b !== url));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-gray-900 p-4 rounded-lg text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Gym Barcodes</h2>
          <button onClick={onClose} className="text-red-400 text-xl">✖</button>
        </div>

        {barcodes.length === 0 && (
          <p className="text-sm text-gray-400 mb-4">Upload your gym barcode scans here (max 3).</p>
        )}

        <div className="grid grid-cols-1 gap-4 mb-4">
          {barcodes.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt={`barcode-${idx}`} className="rounded w-full" />
              <button
                onClick={() => deleteBarcode(url)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {barcodes.length < 3 && (
          <label className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded cursor-pointer">
            {loading ? 'Uploading...' : 'Upload Barcode'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
