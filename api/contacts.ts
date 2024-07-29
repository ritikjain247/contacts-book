import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

interface IContact {
  id: string;
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



// import localforage from "localforage";
// import { matchSorter } from "match-sorter";
// import sortBy from "sort-by";

// // const contact: IContact = {
// //   id: 1,
// //   first: "Your",
// //   last: "Name",
// //   avatar: "https://robohash.org/you.png?size=200x200",
// //   twitter: "your_handle",
// //   notes: "Some notes",
// //   favorite: true,
// // };

// // contacts.js
// /**
//  * @returns {any} Replace `any` with the appropriate type
//  */
// export async function getContacts(query) {
//   await fakeNetwork(`getContacts:${query}`);
//   let contacts = await localforage.getItem("contacts");
//   if (!contacts) contacts = [];
//   if (query) {
//     contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
//   }
//   return contacts.sort(sortBy("last", "createdAt"));
// }

// export async function createContact() {
//   await fakeNetwork();
//   let id = Math.random().toString(36).substring(2, 9);
//   let contact = { id, createdAt: Date.now() };
//   let contacts = await getContacts();
//   contacts.unshift(contact);
//   await set(contacts);
//   return contact;
// }

// export async function getContact(id) {
//   await fakeNetwork(`contact:${id}`);
//   let contacts = await localforage.getItem("contacts");
//   let contact = contacts.find(contact => contact.id === id);
//   return contact ?? null;
// }

// export async function updateContact(id, updates) {
//   await fakeNetwork();
//   let contacts = await localforage.getItem("contacts");
//   let contact = contacts.find(contact => contact.id === id);
//   if (!contact) throw new Error("No contact found for", id);
//   Object.assign(contact, updates);
//   await set(contacts);
//   return contact;
// }

// export async function deleteContact(id) {
//   let contacts = await localforage.getItem("contacts");
//   let index = contacts.findIndex(contact => contact.id === id);
//   if (index > -1) {
//     contacts.splice(index, 1);
//     await set(contacts);
//     return true;
//   }
//   return false;
// }

// function set(contacts) {
//   return localforage.setItem("contacts", contacts);
// }

// // fake a cache so we don't slow down stuff we've already seen
// let fakeCache = {};

// async function fakeNetwork(key) {
//   if (!key) {
//     fakeCache = {};
//   }

//   if (fakeCache[key]) {
//     return;
//   }

//   fakeCache[key] = true;
//   return new Promise(res => {
//     setTimeout(res, Math.random() * 800);
//   });
// }

