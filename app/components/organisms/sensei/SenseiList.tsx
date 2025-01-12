import { Link } from "@remix-run/react";
import { ProfileUsername } from "~/components/molecules/profile";
import { studentImageUrl } from "~/models/assets";

type SenseiListProps = {
  senseis: {
    username: string;
    profileStudentId: string | null;
    friendCode: string | null;
  }[];
}

export default function SenseiList({ senseis }: SenseiListProps) {
  return (
    <>
      {senseis.map((sensei) => {
        return (
          <Link key={`sensei-${sensei.username}`} to={`/@${sensei.username}`}>
            <div className="my-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition rounded-lg">
              <ProfileUsername
                imageUrl={sensei.profileStudentId && studentImageUrl(sensei.profileStudentId)}
                username={sensei.username}
                friendCode={sensei.friendCode}
              />
            </div>
          </Link>
        );
      })}
    </>
  )
}