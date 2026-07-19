import { getApp } from '@oceanfresh/firebase';
import { get, getDatabase, off, onValue, push, ref, remove, set, update } from 'firebase/database';

let _db: ReturnType<typeof getDatabase> | null = null;

function db() {
  if (!_db) {
    _db = getDatabase(getApp());
  }
  return _db;
}

export async function rtdbGet<T>(path: string): Promise<T | null> {
  const snap = await get(ref(db(), path));
  return snap.exists() ? (snap.val() as T) : null;
}

export async function rtdbSet(path: string, data: unknown): Promise<void> {
  await set(ref(db(), path), data);
}

export async function rtdbUpdate(path: string, data: Record<string, unknown>): Promise<void> {
  await update(ref(db(), path), data);
}

export async function rtdbRemove(path: string): Promise<void> {
  await remove(ref(db(), path));
}

export async function rtdbPush(path: string, data: unknown): Promise<string> {
  const newRef = push(ref(db(), path));
  await set(newRef, data);
  return newRef.key as string;
}

export function rtdbSubscribe<T>(path: string, callback: (data: T) => void): () => void {
  const dbRef = ref(db(), path);
  const handler = (snap: { val: () => unknown }) => {
    callback((snap.val() ?? {}) as T);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
}

export async function rtdbList<T>(path: string): Promise<T[]> {
  const snap = await get(ref(db(), path));
  const data = snap.val() ?? {};
  return Object.entries(data).map(
    ([id, val]) => ({ id, ...(val as Record<string, unknown>) }) as unknown as T,
  );
}
