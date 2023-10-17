import { useMatches } from "@remix-run/react";
import { Menu } from "iconoir-react";
import { NavigationLink } from "~/components/atoms/navigation";

type NavigationProps = {
  links: { to: string, text: string }[];
  allowPathPrefix?: boolean;
}

export default function Navigation({ links, allowPathPrefix }: NavigationProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <div className="-mt-4 flex w-full text-gray-700 items-center gap-x-1">
      <Menu className="flex-none mr-2 my-2 h-5 w-5" strokeWidth={2} />
      <div className="py-2 flex flex-nowrap overflow-x-auto">
        {links.map(({ to, text }) => (
          <NavigationLink
            key={`nav-${to}`} to={to} text={text}
            active={allowPathPrefix ? pathname.startsWith(to) : pathname === to}
          />
        ))}
      </div>
    </div>
  );
}
