import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, useLoaderData, useSubmit } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { FormGroup } from "~/components/organisms/form";
import { deletePasskey, getPasskeysBySensei, updatePasskeyMemo } from "~/models/passkey";
import { InputForm, ButtonForm } from "~/components/molecules/form";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const { uid } = params;
  const passkeys = await getPasskeysBySensei(context.cloudflare.env, sensei);
  const passkey = passkeys.find((passkey) => passkey.uid === uid);
  if (!passkey) {
    return redirect("/edit/passkey");
  }
  return { passkey };
};

export const action = async ({ context, request, params }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const { uid } = params;
  console.log(request.method);
  if (request.method === "PATCH") {
    const formData = await request.formData();
    const memo = formData.get("memo") as string;

    await updatePasskeyMemo(env, sensei, uid!, memo);
    return { success: true };
  } else if (request.method === "DELETE") {
    await deletePasskey(env, sensei, uid!);
    return redirect("/edit/passkey");
  } else {
    return new Response(null, { status: 405 });
  }
};

export default function EditPasskey() {
  const { passkey } = useLoaderData<typeof loader>();

  const submit = useSubmit();

  return (
    <>
      <FormGroup method="patch">
        <InputForm label="이름" type="text" name="memo" defaultValue={passkey.memo} />
        <ButtonForm label="이 Passkey 삭제" color="red" onClick={() => {
          if (confirm("정말 삭제할까요? 삭제된 Passkey는 복구할 수 없어요.")) {
            submit(null, { method: "delete" });
          }
        }} />
      </FormGroup>
    </>
  );
}
