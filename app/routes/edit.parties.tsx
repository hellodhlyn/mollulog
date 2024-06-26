import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircle } from "iconoir-react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle } from "~/components/atoms/typography";
import { PartyView } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import type { RaidForPartyQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties, removePartyByUid } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";
import { raidForPartyQuery } from "./$username.parties";

export const meta: MetaFunction = () => [
  { title: "편성 관리 | MolluLog" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const { data } = await runQuery<RaidForPartyQuery>(raidForPartyQuery, {});
  if (!data) {
    throw new Error("failed to load data");
  }

  return json({
    states: (await getUserStudentStates(env, sensei.username, true))!,
    parties: (await getUserParties(env, sensei.username)).reverse(),
    raids: data.raids.nodes,
  });
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  await removePartyByUid(env, sensei, formData.get("uid") as string);
  return redirect(`/edit/parties`);
};

export default function EditParties() {
  const { states, parties, raids } = useLoaderData<typeof loader>();
  return (
    <div className="my-8">
      <SubTitle text="편성 관리" />

      <Link to="/edit/parties/new">
        <div className="my-4 p-4 flex justify-center items-center border border-neutral-200
                        rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer">
          <PlusCircle className="h-4 w-4 mr-2" strokeWidth={2} />
          <span>새로운 편성 추가하기</span>
        </div>
      </Link>

      {parties.map((party) => (
        <PartyView
          key={`party-${party.uid}`}
          party={party}
          studentStates={states}
          raids={raids.map((raid) => ({ ...raid, since: new Date(raid.since)}))}
          editable
        />
      ))}
    </div>
  );
}
