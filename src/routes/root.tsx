import { useEffect } from "react";
import { Form, LoaderFunctionArgs, NavLink, Outlet, redirect, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
// @ts-expect-error import from js file
import { getContacts, createContact } from "../../api/contacts";
import { IContact } from './contact';


// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const contacts = await getContacts(query);
  return { contacts, query };
}

// eslint-disable-next-line react-refresh/only-export-components
export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Layout() {
  const { contacts, query } = useLoaderData() as { contacts: IContact[], query: string };
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  useEffect(() => {
    const inputElement = document.getElementById("q") as HTMLInputElement;
    inputElement.value = query;
  }, [query]);

  return (
    <>
      <div id="sidebar">
        <h1>My Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="query"
              defaultValue={query}
              onChange={(event) => {
                const isFirstSearch = query == null;
                submit(event.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={!searching}
            />
            <div
              className="sr-only"
              aria-live="polite"
            ></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive
                        ? "active"
                        : isPending
                          ? "pending"
                          : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail" className={
        navigation.state === "loading" ? "loading" : ""
      }>
        <Outlet />
      </div>
    </>
  );
}