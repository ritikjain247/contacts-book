import { ActionFunctionArgs, redirect } from "react-router-dom";
// @ts-expect-error import from js file
import { deleteContact } from "../../api/contacts";

export async function action({ params }: ActionFunctionArgs) {
  // throw new Error("oh dang!");
  await deleteContact(params.contactId);
  return redirect("/");
}