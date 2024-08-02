import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

interface IContact {
  id?: string;
  first?: string;
  last?: string;
  avatar?: string;
  twitter?: string;
  notes?: string;
  favorite?: boolean;
  createdAt?: number;
}

async function getContacts(query?: string): Promise<IContact[]> {
  await fakeNetwork(`getContacts:${query}`);
  let contacts: IContact[] = (await localforage.getItem("contacts")) || [];
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

async function createContact(): Promise<IContact> {
  await fakeNetwork();
  const id = Math.random().toString(36).substring(2, 9);
  const contact: IContact = { id, createdAt: Date.now() };
  const contacts = await getContacts();
  contacts.unshift(contact);
  await setContacts(contacts);
  return contact;
}

async function getContact(id: string): Promise<IContact | null> {
  await fakeNetwork(`contact:${id}`);
  const contacts: IContact[] = (await localforage.getItem("contacts")) || [];
  const contact = contacts.find(contact => contact.id === id);
  return contact ?? null;
}

async function updateContact(id: string, updates: Partial<IContact>): Promise<IContact> {
  await fakeNetwork();
  const contacts: IContact[] = (await localforage.getItem("contacts")) || [];
  const contact = contacts.find(contact => contact.id === id);
  if (!contact) throw new Error(`No contact found for id: ${id}`);
  Object.assign(contact, updates);
  await setContacts(contacts);
  return contact;
}

async function deleteContact(id: string): Promise<boolean> {
  const contacts: IContact[] = (await localforage.getItem("contacts")) || [];
  const index = contacts.findIndex(contact => contact.id === id);
  if (index > -1) {
    contacts.splice(index, 1);
    await setContacts(contacts);
    return true;
  }
  return false;
}

function setContacts(contacts: IContact[]): Promise<IContact[]> {
  return localforage.setItem("contacts", contacts);
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: { [key: string]: boolean } = {};

async function fakeNetwork(key?: string): Promise<void> {
  if (!key) {
    fakeCache = {};
  }

  if (key && fakeCache[key]) {
    return;
  }

  if (key) fakeCache[key] = true;
  return new Promise(res => {
    setTimeout(res, Math.random() * 800);
  });
}

export { getContacts, createContact, getContact, updateContact, deleteContact };
