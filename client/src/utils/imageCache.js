import imageCompression from "browser-image-compression";
import { get, set, del, keys } from "idb-keyval";

const CACHE_PREFIX = "blog_draft_";
const IMAGE_CACHE_PREFIX = "blog_images_";
const DRAFT_KEY = "blog_draft_current";

// Compression options
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
};

/**
 * Compress an image file
 */
export const compressImage = async (file) => {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error("Compression failed:", error);
    return file; // Return original if compression fails
  }
};

/**
 * Convert file to base64 for storage
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert base64 to blob for upload
 */
export const base64ToBlob = (base64) => {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Process and compress image, return base64 with metadata
 */
export const processImage = async (file) => {
  // Compress the image
  const compressedFile = await compressImage(file);

  // Convert to base64
  const base64 = await fileToBase64(compressedFile);

  // Generate unique ID
  const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    base64,
    name: file.name,
    size: compressedFile.size,
    originalSize: file.size,
    type: compressedFile.type,
    width: null,
    height: null,
  };
};

/**
 * Cache a single image by ID
 */
export const cacheImage = async (imageId, imageData) => {
  const key = `${IMAGE_CACHE_PREFIX}${imageId}`;
  await set(key, imageData);
};

/**
 * Get a cached image by ID
 */
export const getCachedImage = async (imageId) => {
  const key = `${IMAGE_CACHE_PREFIX}${imageId}`;
  return await get(key);
};

/**
 * Get all cached images
 */
export const getAllCachedImages = async () => {
  const allKeys = await keys();
  const images = {};
  for (const key of allKeys) {
    if (typeof key === "string" && key.startsWith(IMAGE_CACHE_PREFIX)) {
      const imageId = key.replace(IMAGE_CACHE_PREFIX, "");
      images[imageId] = await get(key);
    }
  }
  return images;
};

/**
 * Clear all cached images
 */
export const clearImageCache = async () => {
  const allKeys = await keys();
  for (const key of allKeys) {
    if (typeof key === "string" && key.startsWith(IMAGE_CACHE_PREFIX)) {
      await del(key);
    }
  }
};

/**
 * Cache blog draft
 */
export const cacheDraft = async (draftData) => {
  await set(DRAFT_KEY, {
    ...draftData,
    savedAt: Date.now(),
  });
};

/**
 * Get cached draft
 */
export const getCachedDraft = async () => {
  return await get(DRAFT_KEY);
};

/**
 * Clear draft cache
 */
export const clearDraftCache = async () => {
  await del(DRAFT_KEY);
};

/**
 * Save blog draft to IndexedDB (legacy)
 */
export const saveDraft = async (blogId, data) => {
  const key = `${CACHE_PREFIX}${blogId || "new"}`;
  const draftData = {
    ...data,
    savedAt: Date.now(),
  };
  await set(key, draftData);
  return draftData;
};

/**
 * Get blog draft from IndexedDB (legacy)
 */
export const getDraft = async (blogId) => {
  const key = `${CACHE_PREFIX}${blogId || "new"}`;
  return await get(key);
};

/**
 * Delete blog draft from IndexedDB
 */
export const deleteDraft = async (blogId) => {
  const key = `${CACHE_PREFIX}${blogId || "new"}`;
  await del(key);
};

/**
 * Save images to cache
 */
export const saveImagesToCache = async (blogId, images) => {
  const key = `${IMAGE_CACHE_PREFIX}${blogId || "new"}`;
  await set(key, images);
};

/**
 * Get images from cache
 */
export const getImagesFromCache = async (blogId) => {
  const key = `${IMAGE_CACHE_PREFIX}${blogId || "new"}`;
  return (await get(key)) || [];
};

/**
 * Delete images from cache
 */
export const deleteImagesFromCache = async (blogId) => {
  const key = `${IMAGE_CACHE_PREFIX}${blogId || "new"}`;
  await del(key);
};

/**
 * Clear all drafts and image caches
 */
export const clearAllCache = async () => {
  const allKeys = await keys();
  for (const key of allKeys) {
    if (key.startsWith(CACHE_PREFIX) || key.startsWith(IMAGE_CACHE_PREFIX)) {
      await del(key);
    }
  }
};

/**
 * Get all drafts
 */
export const getAllDrafts = async () => {
  const allKeys = await keys();
  const drafts = [];
  for (const key of allKeys) {
    if (key.startsWith(CACHE_PREFIX)) {
      const draft = await get(key);
      drafts.push({ key, ...draft });
    }
  }
  return drafts;
};
