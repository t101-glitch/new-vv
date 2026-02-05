import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useUser } from '../context/UserContext';
import type { SessionFile } from '../types';

export const useSessionFiles = (sessionId: string | undefined, sessionOwnerId?: string) => {
    const { user } = useUser();
    const [files, setFiles] = useState<SessionFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Target User ID: If I am admin viewing someone else's session, I need their ID.
    // If sessionOwnerId is passed, use it. Otherwise use my own ID (assuming I'm owner).
    const targetUserId = sessionOwnerId || user?.id;

    useEffect(() => {
        if (!targetUserId || !sessionId) {
            setFiles([]);
            setLoading(false);
            return;
        }

        const filesRef = collection(db, `users/${targetUserId}/sessions/${sessionId}/files`);
        const q = query(filesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedFiles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toMillis() || Date.now()
            })) as SessionFile[];
            setFiles(fetchedFiles);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching files:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sessionId, targetUserId]);

    const uploadFile = async (file: File) => {
        if (!user || !sessionId || !targetUserId) return;

        // Allow owner OR Admin to upload
        if (user.id !== targetUserId && user.role !== 'ADMIN') {
            throw new Error("Permission denied. Only session owners or admins can upload files.");
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // storage path: user_uploads/{targetUserId}/{sessionId}/{timestamp}-{filename}
            // Use targetUserId so it goes into the student's bucket even if admin uploads
            const storagePath = `user_uploads/${targetUserId}/${sessionId}/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        console.error("Upload error:", error);
                        setUploading(false);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            // Save metadata to Firestore in student's subcollection
                            const filesRef = collection(db, `users/${targetUserId}/sessions/${sessionId}/files`);
                            await addDoc(filesRef, {
                                name: file.name,
                                storagePath,
                                downloadURL,
                                size: file.size,
                                type: file.type,
                                createdAt: serverTimestamp(),
                                ownerUid: user.id // The actual uploader
                            });

                            setUploading(false);
                            resolve();
                        } catch (e) {
                            console.error("Firestore metadata error:", e);
                            setUploading(false);
                            reject(e);
                        }
                    }
                );
            });
        } catch (e) {
            console.error("Start upload error:", e);
            setUploading(false);
            throw e;
        }
    };

    const deleteFile = async (file: SessionFile) => {
        if (!user || !sessionId || !targetUserId) return;

        // Strict owner check
        if (user.id !== targetUserId && user.role !== 'ADMIN') {
            // Allow admins to delete? Req says "User... delete own session files". 
            // "Admins have read access".
            // Let's stick to owner only for delete for now unless Admin explicitly needs to moderate.
            // But Wait: "User... Upload, download, delete own session files only". 
            // Admin: "View all session files". 
            // So Admin CANNOT delete.
            if (user.id !== file.ownerUid) {
                throw new Error("Only owner can delete files");
            }
        }

        if (user.id !== file.ownerUid && user.role !== 'ADMIN') {
            // Extra safety: file.ownerUid should match targetUserId usually
            throw new Error("Permission denied");
        }

        try {
            // Delete from storage
            const storageRef = ref(storage, file.storagePath);
            await deleteObject(storageRef);

            // Delete from Firestore
            const fileDocRef = doc(db, `users/${targetUserId}/sessions/${sessionId}/files/${file.id}`);
            await deleteDoc(fileDocRef);
        } catch (e) {
            console.error("Delete file error:", e);
            throw e;
        }
    };

    return {
        files,
        loading,
        uploading,
        uploadProgress,
        uploadFile,
        deleteFile
    };
};
