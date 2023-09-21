import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Authenticator } from "remix-auth";
import { Title } from "~/components/atoms/typography";
import { Navigation } from "~/components/organisms/navigation";
import { Sensei } from "~/models/sensei";

type LoaderData = {
  username: string;
  currentUsername: string | null;
}

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");

  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  return json<LoaderData>({
    username,
    currentUsername: sensei?.username || null,
  });
};

export default function Edit() {
  const { username, currentUsername } = useLoaderData<LoaderData>();
  const params = useParams();

  return (
    <>
      <Title text={(username === currentUsername) ? "내 정보" : `@${username}의 학생부`} />
      <Navigation links={[
        { to: `/@${username}/`, text: "프로필" },
        { to: `/@${username}/students`, text: "학생" },
        { to: `/@${username}/parties`, text: "편성" },
      ]} />
      <Outlet key={`user-${params.username}`} />
    </>
  );
}
