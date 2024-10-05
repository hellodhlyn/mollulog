import { Link, useMatches } from "@remix-run/react"

type HeaderProps = {
  currentUsername: string | null;
};

export default function Header({ currentUsername }: HeaderProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <div className="mt-8 mb-12 md:my-16 text-neutral-900">
      <Link to="/" className="hover:opacity-50 transition-opacity">
        <h1 className="my-4 text-4xl md:text-5xl font-ingame">
          <span className="font-bold">몰루</span>로그
        </h1>
      </Link>
      <div className="flex gap-x-4 text-lg tracking-tight">
        {currentUsername && (
          <>
            <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>미래시</span>
            </Link>
            <Link to={`/@${currentUsername}`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>내 정보</span>
            </Link>
            <Link to={`/edit/profile`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>프로필 관리</span>
            </Link>
          </>
        )}
        {currentUsername === null && (
          <>
            <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>미래시</span>
            </Link>
            <Link to="/signin">
              <span>로그인 후 내 정보 관리 →</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
