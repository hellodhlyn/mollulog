import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Env } from "~/env.server";
import { Party, getUserParties } from "~/models/party";
import { Student, getAllStudents } from "~/models/student";

type LoaderData = {
  username: string;
  allStudents: Student[];
  parties: Party[];
}

export const loader: LoaderFunction = async ({ context, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  return json<LoaderData>({
    username,
    allStudents: getAllStudents(),
    parties: await getUserParties(context.env as Env, username),
  });
};

export default function UserPartyPage() {
  const { username, allStudents, parties } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="my-12">
        <Link to={`/@${username}`}>
          <p className="cursor-pointer text-gray-500 hover:underline">← 학생부로</p>
        </Link>
        <h1 className="my-2 font-black text-4xl">@{username}의 편성</h1>
      </div>

      <div>
        {parties.map((party) => (
          <div key={`party-${party.studentIds.join("_")}`} className="my-8">
            <p className="my-2 font-bold text-2xl">{party.name}</p>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-1 md:gap-2">
              {party.studentIds.map((studentId) => {
                const student = allStudents.find((student) => student.id === studentId);
                if (!student) {
                  return null;
                }

                return (
                  <div key={`party-students-${student.id}`}>
                    <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
                    <p className="text-center text-sm">{student.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}