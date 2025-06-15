import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Link, type MetaFunction, Outlet, useLocation } from "react-router";
import { Title } from "~/components/atoms/typography";

export const meta: MetaFunction = () => [
  { title: "Passkey 관리 | 몰루로그" },
];

export default function EditPasskey() {
  const location = useLocation();
  const parentPath = location.pathname.split("/").slice(0, -1).join("/");
  return (
    <>
      <div className="flex items-center gap-x-2">
        <Link to={parentPath}>
          <ChevronLeftIcon className="size-8 md:size-10 hover:text-neutral-500 transition cursor-pointer" />
        </Link>
        <Title text="Passkey 관리" />
      </div>
      <Outlet />
    </>
  )
}
